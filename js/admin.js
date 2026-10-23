// דף ניהול: מעלה קבצים לתיקייה materials/<כיתה>/<רמה>/ ומעדכן את data/materials.json
// דרך ה-API של גיטהאב. האתר מתעדכן כדקה אחרי השמירה.

const REPO = "ayalaariel/math-website";
const BRANCH = "main";
const API = `https://api.github.com/repos/${REPO}/contents/`;
const TOKEN_KEY = "math-website-token";

const $ = id => document.getElementById(id);
let materials = [];

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}

function setToken(value) {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* הדפדפן חוסם אחסון */ }
}

async function gh(path, options = {}) {
  const res = await fetch(API + path.split("/").map(encodeURIComponent).join("/") + (options.method ? "" : `?ref=${BRANCH}`), {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 404 && !options.method) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${body.message || res.statusText}`);
  }
  return res.json();
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function safeName(name) {
  return name.trim().replace(/[\s#?%&\\/:*"<>|]+/g, "-");
}

async function loadMaterials() {
  const file = await gh("data/materials.json");
  materials = file ? JSON.parse(base64ToUtf8(file.content)) : [];
  return file ? file.sha : undefined;
}

async function saveMaterials(update, message) {
  // קוראים את הקובץ מחדש רגע לפני השמירה, כדי לא לדרוס שינוי אחר
  const sha = await loadMaterials();
  update(materials);
  await gh("data/materials.json", {
    method: "PUT",
    body: JSON.stringify({
      message,
      branch: BRANCH,
      sha,
      content: utf8ToBase64(JSON.stringify(materials, null, 2) + "\n"),
    }),
  });
}

async function uploadFile(file, folder) {
  const dot = file.name.lastIndexOf(".");
  const base = safeName(dot > 0 ? file.name.slice(0, dot) : file.name);
  const ext = dot > 0 ? file.name.slice(dot) : "";
  let path = `${folder}/${base}${ext}`;
  for (let i = 2; await gh(path); i++) path = `${folder}/${base}-${i}${ext}`;
  await gh(path, {
    method: "PUT",
    body: JSON.stringify({ message: `העלאת ${file.name}`, branch: BRANCH, content: await fileToBase64(file) }),
  });
  return path;
}

function log(text, cls = "") {
  const box = $("log");
  box.hidden = false;
  box.append(Object.assign(document.createElement("div"), { textContent: text, className: cls }));
}

function currentSection() { return SECTIONS.find(s => s.id === $("f-section").value); }
function currentLevel() { return currentSection().levels.find(l => l.id === $("f-level").value); }

function fillLevels() {
  const section = currentSection();
  $("f-level").replaceChildren(...section.levels.map(l => new Option(l.name, l.id)));
  fillTopics();
}

function fillTopics() {
  const level = currentLevel();
  $("domain-field").hidden = !level.domains;
  $("f-domain").replaceChildren(...(level.domains || []).map(id => new Option(DOMAINS.find(d => d.id === id).name, id)));
  const key = `${$("f-section").value}/${$("f-level").value}`;
  const topics = new Set();
  materials.filter(m => `${m.grade}/${m.level}` === key && m.topic).forEach(m => topics.add(m.topic));
  (CURRICULUM[key] ? CURRICULUM[key].units : []).forEach(u => u.topics.forEach(t => topics.add(t)));
  $("topic-list").replaceChildren(...[...topics].map(t => new Option(t)));
  renderExisting();
}

function renderExisting() {
  const list = $("existing");
  const items = materials
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => m.grade === $("f-section").value && m.level === $("f-level").value);
  if (items.length === 0) {
    list.replaceChildren(Object.assign(document.createElement("li"), { textContent: "אין עדיין חומרים ברמה הזו.", className: "muted" }));
    return;
  }
  list.replaceChildren(...items.map(({ m, index }) => {
    const li = document.createElement("li");
    const tag = Object.assign(document.createElement("span"), { className: `tag tag-${m.type}`, textContent: TYPE_LABELS[m.type] || "חומר" });
    const link = Object.assign(document.createElement("a"), { href: m.file, target: "_blank", textContent: [m.title, (DOMAINS.find(d => d.id === m.domain) || {}).name, m.topic].filter(Boolean).join(" · ") });
    const del = Object.assign(document.createElement("button"), { className: "danger", textContent: "מחיקה", type: "button" });
    del.onclick = () => removeMaterial(index, m);
    li.append(tag, link, del);
    return li;
  }));
}

async function removeMaterial(index, m) {
  if (!confirm(`למחוק את "${m.title}" מהאתר?`)) return;
  try {
    await saveMaterials(list => {
      const i = list.findIndex(x => x.file === m.file && x.title === m.title);
      if (i >= 0) list.splice(i, 1);
    }, `מחיקת ${m.title}`);
    // קובץ שמשויך גם לרמה אחרת (למשל הקבצה א וגם ב) נשאר במאגר
    if (m.file.startsWith("materials/") && !materials.some(x => x.file === m.file)) {
      const existing = await gh(m.file);
      if (existing) {
        await gh(m.file, { method: "DELETE", body: JSON.stringify({ message: `מחיקת ${m.file}`, branch: BRANCH, sha: existing.sha }) });
      }
    }
    fillTopics();
  } catch (e) {
    alert("המחיקה נכשלה: " + e.message);
  }
}

async function onSubmit(e) {
  e.preventDefault();
  if (!getToken()) { alert("קודם צריך לשמור מפתח גישה למעלה."); return; }

  const grade = $("f-section").value;
  const level = $("f-level").value;
  const type = $("f-type").value;
  const domain = currentLevel().domains ? $("f-domain").value : undefined;
  const topic = $("f-topic").value.trim();
  const title = $("f-title").value.trim();
  const useUrl = document.querySelector("input[name=source]:checked").value === "url";
  const files = [...$("f-files").files];

  if (useUrl && !$("f-url").value) { alert("חסרה כתובת."); return; }
  if (!useUrl && files.length === 0) { alert("לא נבחר קובץ."); return; }
  if ((useUrl || files.length === 1) && !title) { alert("חסר שם לחומר."); return; }

  $("submit").disabled = true;
  $("log").replaceChildren();
  const added = [];
  try {
    if (useUrl) {
      added.push({ grade, level, domain, topic, title, type, file: $("f-url").value });
    } else {
      for (const file of files) {
        log(`מעלה את ${file.name}…`);
        const path = await uploadFile(file, `materials/${grade}/${level}`);
        const fileTitle = files.length === 1 ? title : (title ? `${title} – ` : "") + file.name.replace(/\.[^.]+$/, "");
        added.push({ grade, level, domain, topic, title: fileTitle, type, file: path });
      }
    }
    log("מעדכן את רשימת החומרים…");
    await saveMaterials(list => list.push(...added), `הוספת ${added.length === 1 ? added[0].title : added.length + " חומרים"}`);
    log(`נוסף${added.length > 1 ? "ו " + added.length + " חומרים" : ""}! האתר יתעדכן בעוד כדקה.`, "ok");
    $("f-title").value = "";
    $("f-files").value = "";
    $("f-url").value = "";
    fillTopics();
  } catch (err) {
    log("שגיאה: " + err.message, "err");
  } finally {
    $("submit").disabled = false;
  }
}

async function checkToken() {
  const status = $("token-status");
  if (!getToken()) { status.textContent = "לא מחובר."; return; }
  status.textContent = "בודק…";
  try {
    await loadMaterials();
    status.textContent = "מחובר ✓";
    status.className = "ok";
    fillTopics();
  } catch (e) {
    status.textContent = "המפתח לא עובד: " + e.message;
    status.className = "err";
  }
}

function init() {
  $("f-section").replaceChildren(...SECTIONS.map(s => new Option(s.name, s.id)));
  $("f-type").replaceChildren(...Object.entries(TYPE_LABELS).map(([id, name]) => new Option(name, id)));
  $("f-section").onchange = fillLevels;
  $("f-level").onchange = fillTopics;
  fillLevels();

  document.querySelectorAll("input[name=source]").forEach(r => {
    r.onchange = () => {
      const useUrl = r.value === "url" && r.checked;
      $("url-field").hidden = !useUrl;
      $("file-field").hidden = useUrl;
    };
  });

  $("token").value = getToken();
  $("save-token").onclick = () => { setToken($("token").value.trim()); checkToken(); };
  $("clear-token").onclick = () => { setToken(""); $("token").value = ""; checkToken(); };
  $("add-form").onsubmit = onSubmit;

  // לפני חיבור, מציגים את הרשימה מהאתר עצמו
  fetch("data/materials.json", { cache: "no-cache" })
    .then(r => r.json()).then(data => { if (!materials.length) { materials = data; fillTopics(); } })
    .catch(() => {});
  checkToken();
}

init();
