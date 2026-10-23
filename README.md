# אתר חומרי לימוד במתמטיקה

אתר סטטי פשוט (HTML, CSS, JavaScript), מתפרסם ב-GitHub Pages:
https://ayalaariel.github.io/math-website/

## מבנה

- כיתה ז׳: חומרי הכיתה (מחולקים לאלגברה וגיאומטריה), עמ״ט
- כיתות ח׳–ט׳: הקבצה א, הקבצה ב (כל אחת מחולקת לאלגברה וגיאומטריה), עמ״ט
- כיתות י׳–י״ב: 3, 4, 5 יחידות

קבצים:
- `data/structure.js` – הכיתות, הרמות והתחומים
- `data/curriculum.js` – פריסת תוכנית הלימודים של משרד החינוך (תשפ״ז) לכל כיתה ורמה
- `data/materials.json` – רשימת החומרים
- `materials/<כיתה>/<רמה>/` – קבצי החומרים עצמם
- `admin.html` – דף להוספת חומרים ומחיקתם

## הוספת חומר

הדרך הפשוטה: נכנסים ל-[דף הניהול](https://ayalaariel.github.io/math-website/admin.html), מחברים מפתח גישה של גיטהאב (ההסבר בדף), ומעלים קבצים.

ידנית: שמים את הקובץ ב-`materials/<מדור>/<רמה>/` ומוסיפים רשומה ל-`data/materials.json`:

```json
{ "grade": "8", "level": "a", "domain": "geometry", "topic": "דמיון משולשים", "title": "דף עבודה", "type": "worksheet", "file": "materials/8/a/thales.pdf" }
```

ערכים אפשריים ל-`grade`: 7–12. ל-`level`: `general`/`amat` (ז׳), `a`/`b`/`amat` (ח׳–ט׳), `3`/`4`/`5` (י׳–י״ב).
`domain` (רק בחומרי הכיתה בז׳ ובהקבצות בח׳–ט׳): `algebra` או `geometry`.
סוגים: summary, worksheet, exam, solution, presentation, video, link.
