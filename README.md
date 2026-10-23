# אתר חומרי לימוד במתמטיקה

אתר סטטי פשוט (HTML, CSS, JavaScript) – בלי התקנות ובלי שרת.
אפשר לפתוח את `index.html` ישירות בדפדפן, ואפשר לפרסם אותו בחינם ב-GitHub Pages.

## מבנה

- `index.html` – העמוד הראשי
- `data/materials.js` – רשימת הכיתות, הרמות והחומרים
- `materials/grade-<כיתה>/level-<רמה>/` – קבצי החומרים עצמם (PDF וכו׳)
- `css/style.css`, `js/app.js` – עיצוב ולוגיקה

## הוספת חומר

1. שמים את הקובץ בתיקייה המתאימה, למשל `materials/grade-10/level-5/`.
2. מוסיפים שורה ב-`data/materials.js`:

```js
{ grade: 10, level: 5, topic: "פונקציה ריבועית", title: "סיכום", type: "summary", file: "materials/grade-10/level-5/summary.pdf" },
```
