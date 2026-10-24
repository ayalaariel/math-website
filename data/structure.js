// מבנה האתר: כיתות, ובכל כיתה – רמות. ברמה שיש לה domains, החומרים מחולקים גם לפי תחום.
// כל חומר ב-materials.json משויך לכיתה (grade), לרמה (level) ולפעמים לתחום (domain), לפי ה-id שלהם כאן.

const DOMAINS = [
  { id: "algebra", name: "אלגברה" },
  { id: "geometry", name: "גיאומטריה" },
];
const BY_DOMAIN = DOMAINS.map(d => d.id);

const SECTIONS = [
  { id: "7",  name: "כיתה ז׳",  short: "ז׳",  levels: [
    { id: "general", name: "חומרי הכיתה", domains: BY_DOMAIN },
    { id: "amat", name: "עמ״ט" },
  ] },
  { id: "8",  name: "כיתה ח׳",  short: "ח׳",  levels: [
    { id: "a", name: "הקבצה א", domains: BY_DOMAIN },
    { id: "b", name: "הקבצה ב", domains: BY_DOMAIN },
    { id: "amat", name: "עמ״ט" },
  ] },
  { id: "9",  name: "כיתה ט׳",  short: "ט׳",  levels: [
    { id: "a", name: "הקבצה א", domains: BY_DOMAIN },
    { id: "b", name: "הקבצה ב", domains: BY_DOMAIN },
    { id: "amat", name: "עמ״ט" },
  ] },
  { id: "10", name: "כיתה י׳",  short: "י׳",  levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
  { id: "11", name: "כיתה י״א", short: "י״א", levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
  { id: "12", name: "כיתה י״ב", short: "י״ב", levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
];

const TYPE_LABELS = {
  summary: "סיכום",
  worksheet: "דף עבודה",
  quiz: "בוחן",
  exam: "מבחן",
  summer: "עבודת קיץ",
  solution: "פתרון",
  presentation: "מצגת",
  video: "סרטון",
  link: "קישור",
};
