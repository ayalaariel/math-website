# אתר חומרי לימוד במתמטיקה

אתר סטטי פשוט (HTML, CSS, JavaScript), מתפרסם ב-GitHub Pages:
https://ayalaariel.github.io/math-website/

## מבנה

- כיתות ז׳–ט׳: הקבצה א, הקבצה ב
- כיתות י׳–י״ב: 3, 4, 5 יחידות
- עמ״ט: מחלקה נפרדת, כיתות ז׳–ט׳

קבצים:
- `data/structure.js` – המדורים והרמות
- `data/curriculum.js` – פריסת תוכנית הלימודים של משרד החינוך (תשפ״ז) לכל מדור ורמה
- `data/materials.json` – רשימת החומרים
- `materials/<מדור>/<רמה>/` – קבצי החומרים עצמם
- `admin.html` – דף להוספת חומרים ומחיקתם

## הוספת חומר

הדרך הפשוטה: נכנסים ל-[דף הניהול](https://ayalaariel.github.io/math-website/admin.html), מחברים מפתח גישה של גיטהאב (ההסבר בדף), ומעלים קבצים.

ידנית: שמים את הקובץ ב-`materials/<מדור>/<רמה>/` ומוסיפים רשומה ל-`data/materials.json`:

```json
{ "grade": "10", "level": "5", "topic": "משפט תאלס", "title": "דף עבודה", "type": "worksheet", "file": "materials/10/5/thales.pdf" }
```

ערכים אפשריים ל-`grade`: 7–12 או `amat`. ל-`level`: `a`/`b` (ז׳–ט׳), `3`/`4`/`5` (י׳–י״ב), `7`/`8`/`9` (עמ״ט).
סוגים: summary, worksheet, exam, solution, presentation, video, link.
