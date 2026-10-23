// ניתוב לפי כתובת: #/  ,  #/s/10  ,  #/s/10/4  ,  #/search/<מילים>

const app = document.getElementById("app");
const searchInput = document.getElementById("search-input");
let MATERIALS = [];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (value !== "" && value != null) node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

function findSection(id) { return SECTIONS.find(s => s.id === id); }
function findLevel(section, id) { return section && section.levels.find(l => l.id === id); }

function countMaterials(sectionId, levelId) {
  return MATERIALS.filter(m => m.grade === sectionId && (levelId === undefined || m.level === levelId)).length;
}

function countLabel(n) {
  if (n === 0) return "אין עדיין חומרים";
  if (n === 1) return "חומר אחד";
  return `${n} חומרים`;
}

function breadcrumbs(...items) {
  const nav = el("nav", { class: "breadcrumbs" });
  items.forEach((item, i) => {
    if (i > 0) nav.append(el("span", { class: "sep" }, "‹"));
    nav.append(item.href ? el("a", { href: item.href }, item.label) : el("span", {}, item.label));
  });
  return nav;
}

function materialItem(m, withPlace) {
  const isExternal = /^https?:/.test(m.file);
  const section = findSection(m.grade);
  const level = findLevel(section, m.level);
  return el("li", {},
    el("span", { class: `tag tag-${m.type}` }, TYPE_LABELS[m.type] || "חומר"),
    el("a", { href: m.file, target: "_blank", rel: isExternal ? "noopener" : "" }, m.title),
    withPlace && section
      ? el("a", { class: "place", href: `#/s/${section.id}/${m.level}` }, `${section.short}${level ? " · " + level.name : ""}${m.topic ? " · " + m.topic : ""}`)
      : null
  );
}

function renderHome() {
  const grid = el("div", { class: "card-grid" });
  for (const section of SECTIONS) {
    grid.append(
      el("a", { class: `card${section.id === "amat" ? " card-amat" : ""}`, href: `#/s/${section.id}` },
        el("h2", {}, section.name),
        el("p", { class: "muted" }, section.levels.map(l => l.name).join(" · ")),
        el("p", { class: "muted small" }, countLabel(countMaterials(section.id)))
      )
    );
  }
  app.replaceChildren(
    el("section", { class: "hero" },
      el("h1", {}, "חומרי לימוד במתמטיקה"),
      el("p", {}, "סיכומים, דפי עבודה ומבחנים לכיתות ז׳–י״ב, לפי רמת לימוד, ולצידם פריסת תוכנית הלימודים של משרד החינוך.")
    ),
    grid
  );
}

function renderSection(section) {
  const grid = el("div", { class: "card-grid" });
  for (const level of section.levels) {
    grid.append(
      el("a", { class: `card level-${level.id}`, href: `#/s/${section.id}/${level.id}` },
        el("h2", {}, level.name),
        el("p", { class: "muted" }, countLabel(countMaterials(section.id, level.id)))
      )
    );
  }
  app.replaceChildren(
    breadcrumbs({ label: "ראשי", href: "#/" }, { label: section.name }),
    el("h1", {}, section.name),
    el("p", {}, section.id === "amat" ? "בחרו כיתה:" : "בחרו רמת לימוד:"),
    grid
  );
}

function curriculumBlock(key) {
  const c = CURRICULUM[key];
  if (!c) return null;
  const units = el("div", { class: "units" });
  for (const unit of c.units) {
    units.append(el("div", { class: "unit" },
      el("h3", {}, unit.name),
      el("ol", {}, ...unit.topics.map(t => el("li", {}, t)))
    ));
  }
  const sources = el("p", { class: "sources" }, "מקור: ");
  c.sources.forEach((s, i) => {
    if (i > 0) sources.append(" · ");
    sources.append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.label));
  });
  return el("details", { class: "curriculum" },
    el("summary", {}, "תוכנית הלימודים – משרד החינוך, תשפ״ז"),
    c.note ? el("p", { class: "note" }, c.note) : null,
    units,
    sources
  );
}

function renderLevel(section, level) {
  const items = MATERIALS.filter(m => m.grade === section.id && m.level === level.id);
  const content = [];

  if (items.length === 0) {
    content.push(el("p", { class: "empty" }, "עדיין אין חומרים לרמה הזו. בקרוב!"));
  } else {
    const byTopic = new Map();
    for (const m of items) {
      const topic = m.topic || "כללי";
      if (!byTopic.has(topic)) byTopic.set(topic, []);
      byTopic.get(topic).push(m);
    }
    for (const [topic, list] of byTopic) {
      content.push(el("section", { class: "topic" },
        el("h2", {}, topic),
        el("ul", { class: "material-list" }, ...list.map(m => materialItem(m, false)))
      ));
    }
  }

  const title = section.id === "amat" ? `עמ״ט · ${level.name}` : `${section.name} · ${level.name}`;
  app.replaceChildren(
    breadcrumbs(
      { label: "ראשי", href: "#/" },
      { label: section.name, href: `#/s/${section.id}` },
      { label: level.name }
    ),
    el("h1", {}, title),
    curriculumBlock(`${section.id}/${level.id}`) || "",
    el("h2", { class: "materials-title" }, "חומרים"),
    ...content
  );
}

function normalize(text) {
  return (text || "").toLowerCase().replace(/["'׳״]/g, "");
}

function renderSearch(query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const results = MATERIALS.filter(m => {
    const section = findSection(m.grade);
    const level = findLevel(section, m.level);
    const haystack = normalize([m.title, m.topic, TYPE_LABELS[m.type], section && section.name, section && section.short, level && level.name].join(" "));
    return words.every(w => haystack.includes(w));
  });

  app.replaceChildren(
    breadcrumbs({ label: "ראשי", href: "#/" }, { label: "חיפוש" }),
    el("h1", {}, `תוצאות חיפוש: ${query}`),
    results.length === 0
      ? el("p", { class: "empty" }, "לא נמצאו חומרים. נסו מילה אחרת, למשל שם נושא או כיתה.")
      : el("section", { class: "topic" },
          el("p", { class: "muted" }, countLabel(results.length)),
          el("ul", { class: "material-list" }, ...results.map(m => materialItem(m, true)))
        )
  );
}

function renderNav(activeId) {
  const nav = document.getElementById("grade-nav");
  nav.replaceChildren(
    ...SECTIONS.map(s => el("a", { href: `#/s/${s.id}`, class: s.id === activeId ? "active" : "" }, s.short))
  );
}

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);

  if (parts[0] === "search") {
    const query = parts.slice(1).join("/");
    searchInput.value = query;
    renderNav(null);
    renderSearch(query);
  } else {
    const section = parts[0] === "s" ? findSection(parts[1]) : null;
    const level = findLevel(section, parts[2]);
    renderNav(section ? section.id : null);
    if (section && level) renderLevel(section, level);
    else if (section) renderSection(section);
    else renderHome();
  }
  window.scrollTo(0, 0);
}

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) location.hash = `#/search/${encodeURIComponent(q)}`;
});

window.addEventListener("hashchange", route);

fetch("data/materials.json", { cache: "no-cache" })
  .then(r => r.json())
  .then(data => { MATERIALS = data; })
  .catch(() => { MATERIALS = []; })
  .finally(route);
