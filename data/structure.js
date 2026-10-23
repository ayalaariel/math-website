// מבנה האתר: מדורים (כיתות ועמ"ט), ובכל מדור – רמות.
// כל חומר ב-materials.json משויך למדור (grade) ולרמה (level) לפי ה-id שלהם כאן.

const SECTIONS = [
  { id: "7",  name: "כיתה ז׳",  short: "ז׳",  levels: [{ id: "a", name: "הקבצה א" }, { id: "b", name: "הקבצה ב" }] },
  { id: "8",  name: "כיתה ח׳",  short: "ח׳",  levels: [{ id: "a", name: "הקבצה א" }, { id: "b", name: "הקבצה ב" }] },
  { id: "9",  name: "כיתה ט׳",  short: "ט׳",  levels: [{ id: "a", name: "הקבצה א" }, { id: "b", name: "הקבצה ב" }] },
  { id: "10", name: "כיתה י׳",  short: "י׳",  levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
  { id: "11", name: "כיתה י״א", short: "י״א", levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
  { id: "12", name: "כיתה י״ב", short: "י״ב", levels: [{ id: "3", name: "3 יחידות" }, { id: "4", name: "4 יחידות" }, { id: "5", name: "5 יחידות" }] },
  { id: "amat", name: "עמ״ט – מחלקה למצוינות", short: "עמ״ט", levels: [{ id: "7", name: "כיתה ז׳" }, { id: "8", name: "כיתה ח׳" }, { id: "9", name: "כיתה ט׳" }] },
];

const TYPE_LABELS = {
  summary: "סיכום",
  worksheet: "דף עבודה",
  exam: "מבחן",
  solution: "פתרון",
  presentation: "מצגת",
  video: "סרטון",
  link: "קישור",
};
