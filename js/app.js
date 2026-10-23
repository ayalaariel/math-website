// ניתוב פשוט לפי כתובת: #/  ,  #/grade/10  ,  #/grade/10/level/5

const TYPE_LABELS = {
  summary: "סיכום",
  worksheet: "דף עבודה",
  exam: "מבחן",
  solution: "פתרון",
  video: "סרטון",
  link: "קישור",
};

const app = document.getElementById("app");

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

function countMaterials(grade, level) {
  return MATERIALS.filter(m => m.grade === grade && (level === undefined || m.level === level)).length;
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

function renderHome() {
  const grid = el("div", { class: "card-grid" });
  for (const grade of GRADES) {
    grid.append(
      el("a", { class: "card", href: `#/grade/${grade.id}` },
        el("h2", {}, grade.name),
        el("p", { class: "muted" }, countLabel(countMaterials(grade.id)))
      )
    );
  }
  app.replaceChildren(
    el("section", { class: "hero" },
      el("h1", {}, "חומרי לימוד במתמטיקה"),
      el("p", {}, "סיכומים, דפי עבודה ומבחנים לכיתות ז׳–י״ב, לפי רמת לימוד. בחרו כיתה:")
    ),
    grid
  );
}

function renderGrade(grade) {
  const grid = el("div", { class: "card-grid" });
  for (const level of LEVELS) {
    grid.append(
      el("a", { class: `card level-${level.id}`, href: `#/grade/${grade.id}/level/${level.id}` },
        el("h2", {}, level.name),
        el("p", { class: "muted" }, countLabel(countMaterials(grade.id, level.id)))
      )
    );
  }
  app.replaceChildren(
    breadcrumbs({ label: "ראשי", href: "#/" }, { label: grade.name }),
    el("h1", {}, grade.name),
    el("p", {}, "בחרו רמת לימוד:"),
    grid
  );
}

function renderLevel(grade, level) {
  const items = MATERIALS.filter(m => m.grade === grade.id && m.level === level.id);
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
      const ul = el("ul", { class: "material-list" });
      for (const m of list) {
        const isExternal = /^https?:/.test(m.file);
        ul.append(
          el("li", {},
            el("span", { class: `tag tag-${m.type}` }, TYPE_LABELS[m.type] || "חומר"),
            el("a", { href: m.file, target: "_blank", rel: isExternal ? "noopener" : "" }, m.title)
          )
        );
      }
      content.push(el("section", { class: "topic" }, el("h2", {}, topic), ul));
    }
  }

  app.replaceChildren(
    breadcrumbs(
      { label: "ראשי", href: "#/" },
      { label: grade.name, href: `#/grade/${grade.id}` },
      { label: level.name }
    ),
    el("h1", {}, `${grade.name} · ${level.name}`),
    ...content
  );
}

function renderNav(activeGrade) {
  const nav = document.getElementById("grade-nav");
  nav.replaceChildren(
    ...GRADES.map(g =>
      el("a", { href: `#/grade/${g.id}`, class: g.id === activeGrade ? "active" : "" }, g.name.replace("כיתה ", ""))
    )
  );
}

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const grade = parts[0] === "grade" ? GRADES.find(g => g.id === Number(parts[1])) : null;
  const level = grade && parts[2] === "level" ? LEVELS.find(l => l.id === Number(parts[3])) : null;

  renderNav(grade ? grade.id : null);
  if (grade && level) renderLevel(grade, level);
  else if (grade) renderGrade(grade);
  else renderHome();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();
