// רשימת החומרים באתר.
// כדי להוסיף חומר: שמים את הקובץ בתיקייה materials/grade-<כיתה>/level-<רמה>/
// ומוסיפים שורה לרשימה MATERIALS למטה.
//
// שדות:
//   grade  – מספר הכיתה: 7, 8, 9, 10, 11, 12
//   level  – רמת הלימוד: 3, 4, 5 (יחידות לימוד)
//   topic  – נושא (חומרים עם אותו נושא יוצגו יחד)
//   title  – שם החומר
//   type   – סוג: "summary" (סיכום), "worksheet" (דף עבודה), "exam" (מבחן),
//            "solution" (פתרון), "video" (סרטון), "link" (קישור)
//   file   – נתיב לקובץ, או כתובת אינטרנט

const GRADES = [
  { id: 7,  name: "כיתה ז׳" },
  { id: 8,  name: "כיתה ח׳" },
  { id: 9,  name: "כיתה ט׳" },
  { id: 10, name: "כיתה י׳" },
  { id: 11, name: "כיתה י״א" },
  { id: 12, name: "כיתה י״ב" },
];

const LEVELS = [
  { id: 3, name: "3 יחידות" },
  { id: 4, name: "4 יחידות" },
  { id: 5, name: "5 יחידות" },
];

const MATERIALS = [
  // דוגמה (אפשר למחוק):
  // { grade: 10, level: 5, topic: "פונקציה ריבועית", title: "סיכום – פונקציה ריבועית", type: "summary", file: "materials/grade-10/level-5/quadratic-summary.pdf" },
];
