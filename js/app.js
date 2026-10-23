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

function materialItem(m, withPlace, withTopic) {
  const isExternal = /^https?:/.test(m.file);
  const section = findSection(m.grade);
  const level = findLevel(section, m.level);
  const domain = DOMAINS.find(d => d.id === m.domain);
  return el("li", {},
    el("span", { class: `tag tag-${m.type}` }, TYPE_LABELS[m.type] || "חומר"),
    el("a", { href: m.file, target: "_blank", rel: isExternal ? "noopener noreferrer" : "" }, m.title),
    withPlace && section
      ? el("a", { class: "place", href: `#/s/${section.id}/${m.level}` }, [section.short, level && level.name, domain && domain.name, m.topic].filter(Boolean).join(" · "))
      : withTopic && m.topic ? el("span", { class: "place" }, [domain && domain.name, m.topic].filter(Boolean).join(" · ")) : null
  );
}

function renderHome() {
  const grid = el("div", { class: "card-grid" });
  for (const section of SECTIONS) {
    grid.append(
      el("a", { class: "card", href: `#/s/${section.id}` },
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
  const paced = section.levels.filter(l => PACING[`${section.id}/${l.id}`]);
  let overview = null;
  if (paced.length) {
    const start = today();
    overview = el("section", { class: "pace" },
      el("h2", {}, "התוכנית לשבועיים הקרובים", el("span", { class: "muted" }, ` · ${dateRange(start, new Date(start.getTime() + 13 * DAY))}`)),
      el("div", { class: "pace-levels" }, ...paced.map(l =>
        el("div", { class: `pace-level level-${l.id}` },
          el("h3", {}, el("a", { href: `#/s/${section.id}/${l.id}` }, l.name)),
          nextTwoWeeks(`${section.id}/${l.id}`, true)
        )
      ))
    );
  }
  app.replaceChildren(
    breadcrumbs({ label: "ראשי", href: "#/" }, { label: section.name }),
    el("h1", {}, section.name),
    el("p", {}, "בחרו:"),
    grid,
    overview || ""
  );
}

const MONTH_NAMES = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const DAY = 24 * 60 * 60 * 1000;

// לבדיקה אפשר לקבוע תאריך בכתובת: ?date=2026-11-25
function today() {
  const forced = new URLSearchParams(location.search).get("date");
  const d = forced ? new Date(forced + "T00:00:00") : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) { return `${d.getDate()}.${d.getMonth() + 1}`; }
function parseDate(s) { return new Date(s + "T00:00:00"); }
function dateRange(a, b) { return `${formatDate(a)} עד ${formatDate(b)}`; }

// החודשים (בשנת הלימודים) שנוגעים בחלון של השבועיים הקרובים
function upcomingMonths(start, end) {
  const result = [];
  for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const from = d < start ? start : d;
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    result.push({ month: d.getMonth() + 1, from, to: monthEnd > end ? end : monthEnd });
  }
  return result;
}

function nextTwoWeeks(key, compact) {
  const p = PACING[key];
  if (!p) return null;
  const start = today();
  const end = new Date(start.getTime() + 13 * DAY);
  const months = upcomingMonths(start, end).filter(m => p.months[m.month]);

  const body = [];
  if (months.length === 0) {
    body.push(el("p", { class: "muted" }, "חופשת הקיץ. הפריסה של שנת הלימודים הבאה תתפרסם לקראת ספטמבר."));
  }
  for (const m of months) {
    const data = p.months[m.month];
    const block = el("div", { class: "pace-month" },
      months.length > 1 || !compact
        ? el("h4", {}, `${MONTH_NAMES[m.month - 1]} (${dateRange(m.from, m.to)})`, el("span", { class: "muted" }, ` · ${data.hours} שעות בחודש`))
        : null,
      el("ul", {}, ...data.items.map(([domain, topics, hours]) =>
        el("li", {}, el("b", {}, domain + ": "), topics, hours ? el("span", { class: "muted" }, ` (${hours} ש׳)`) : null)
      ))
    );
    if (p.extra && p.extra[m.month]) {
      block.querySelector("ul").append(el("li", { class: "extra" }, el("b", {}, "תוספת עמ״ט: "), p.extra[m.month]));
    }
    body.push(block);
  }

  const due = (p.assessments || []).filter(a => parseDate(a.from) <= end && parseDate(a.to) >= start);
  for (const a of due) {
    body.push(el("p", { class: "assessment" },
      el("b", {}, `📝 ${a.name}: `), `${dateRange(parseDate(a.from), parseDate(a.to))}`,
      a.details ? el("span", {}, ` · ${a.details}`) : null
    ));
  }

  return el("section", { class: compact ? "pace pace-compact" : "pace" },
    el(compact ? "h3" : "h2", {}, compact ? "" : "התוכנית לשבועיים הקרובים", compact ? "" : el("span", { class: "muted" }, ` · ${dateRange(start, end)}`)),
    ...body
  );
}

function pacingTable(key) {
  const p = PACING[key];
  if (!p) return null;
  const order = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const current = today().getMonth() + 1;
  const rows = order.filter(m => p.months[m]).map(m => {
    const data = p.months[m];
    return el("tr", { class: m === current ? "current" : "" },
      el("th", {}, MONTH_NAMES[m - 1], el("div", { class: "muted small" }, `${data.hours} ש׳`)),
      el("td", {},
        ...data.items.map(([domain, topics]) => el("div", {}, el("b", {}, domain + ": "), topics)),
        p.extra && p.extra[m] ? el("div", { class: "extra" }, el("b", {}, "תוספת עמ״ט: "), p.extra[m]) : null
      )
    );
  });
  const assess = (p.assessments || []).map(a =>
    el("li", {}, el("b", {}, a.name + ": "), `${dateRange(parseDate(a.from), parseDate(a.to))}`, a.details ? ` · ${a.details}` : "")
  );
  return el("details", { class: "curriculum" },
    el("summary", {}, "הפריסה החודשית לכל השנה"),
    el("table", { class: "pace-table" }, el("tbody", {}, ...rows)),
    assess.length ? el("div", {}, el("h3", {}, "משימות הערכה ומבחנים"), el("ul", {}, ...assess)) : null
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
    sources.append(el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer" }, s.label));
  });
  return el("details", { class: "curriculum" },
    el("summary", {}, "תוכנית הלימודים – משרד החינוך, תשפ״ז"),
    c.note ? el("p", { class: "note" }, c.note) : null,
    units,
    sources
  );
}

function topicSections(items, headingTag) {
  const byTopic = new Map();
  for (const m of items) {
    const topic = m.topic || "כללי";
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic).push(m);
  }
  return [...byTopic].map(([topic, list]) =>
    el("section", { class: "topic" },
      el(headingTag, {}, topic),
      el("ul", { class: "material-list" }, ...list.map(m => materialItem(m, false)))
    )
  );
}

const ASSESSMENT_TYPES = [
  { type: "quiz", title: "בחנים" },
  { type: "exam", title: "מבחנים" },
];

function assessmentRubrics(all) {
  return el("div", { class: "rubrics" }, ...ASSESSMENT_TYPES.map(({ type, title }) => {
    const list = all.filter(m => m.type === type);
    return el("section", { class: `topic rubric rubric-${type}` },
      el("h2", {}, title),
      list.length
        ? el("ul", { class: "material-list" }, ...list.map(m => materialItem(m, false, true)))
        : el("p", { class: "muted" }, `עדיין אין ${title}.`)
    );
  }));
}

function renderLevel(section, level) {
  const key = `${section.id}/${level.id}`;
  const all = MATERIALS.filter(m => m.grade === section.id && m.level === level.id);
  // בחנים ומבחנים מוצגים ברובריקות משלהם, שאר החומרים לפי תחום ונושא
  const items = all.filter(m => !ASSESSMENT_TYPES.some(a => a.type === m.type));
  const content = [];

  if (level.domains) {
    // חלוקה לפי תחום (אלגברה / גיאומטריה), ובכל תחום לפי נושא
    const groups = level.domains.map(id => DOMAINS.find(d => d.id === id));
    const other = items.filter(m => !level.domains.includes(m.domain));
    if (other.length) groups.push({ id: null, name: "נוספים" });
    for (const domain of groups) {
      const list = domain.id ? items.filter(m => m.domain === domain.id) : other;
      content.push(el("div", { class: "domain" },
        el("h2", { class: "domain-title" }, domain.name),
        ...(list.length ? topicSections(list, "h3") : [el("p", { class: "empty" }, "עדיין אין חומרים. בקרוב!")])
      ));
    }
  } else if (items.length === 0) {
    content.push(el("h2", { class: "materials-title" }, "חומרים"));
    content.push(el("p", { class: "empty" }, "עדיין אין חומרים לרמה הזו. בקרוב!"));
  } else {
    content.push(el("h2", { class: "materials-title" }, "חומרים"));
    content.push(...topicSections(items, "h2"));
  }

  app.replaceChildren(
    breadcrumbs(
      { label: "ראשי", href: "#/" },
      { label: section.name, href: `#/s/${section.id}` },
      { label: level.name }
    ),
    el("h1", {}, `${section.name} · ${level.name}`),
    nextTwoWeeks(key, false) || "",
    pacingTable(key) || "",
    curriculumBlock(key) || "",
    assessmentRubrics(all),
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
    const domain = DOMAINS.find(d => d.id === m.domain);
    const haystack = normalize([m.title, m.topic, TYPE_LABELS[m.type], section && section.name, section && section.short, level && level.name, domain && domain.name].join(" "));
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
