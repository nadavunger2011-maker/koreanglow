
## מטרה
1. לחלץ ולספק לך את 16 כתובות דפי המוצר המלאות באתר.
2. לבצע אופטימיזציית SEO מקיפה (בעברית) עבור הביטויים: **טיפוח קוריאני, קוסמטיקה קוריאנית, מוצרי טיפוח קוריאניים, סרום ניאצינאמיד, Glass Skin / עור זכוכית, K-Beauty**.

---

## חלק 1 — רשימת 16 דפי המוצר

לאחר אישור החיבור ל-Shopify, אריץ `shopify--list_products` ואחזיר טבלה עם:
- שם המוצר
- ה-handle
- כתובת URL מלאה בפורמט: `https://korean-glow-il.shop/product/{handle}`

הרשימה תיכלל גם ב-`sitemap.xml` (ראה חלק 2).

---

## חלק 2 — תיקוני SEO מאחורי הקלעים

### A. `index.html` — תיקונים קריטיים
כרגע הכותרת והתיאור באנגלית והדומיין הקנוני לא תואם. אעדכן:
- `<html lang="he" dir="rtl">` במקום `lang="en"`
- **Title:** `קוריאן גלואו | טיפוח קוריאני וקוסמטיקה קוריאנית מקורית - K-Beauty`
- **Meta description:** טקסט בעברית ~155 תווים שכולל "טיפוח קוריאני", "קוסמטיקה קוריאנית", "עור זכוכית", "סרום ניאצינאמיד"
- **og:title / og:description / twitter:** מקבילים בעברית
- **canonical + og:url** ← `https://korean-glow-il.shop/` (במקום `koreanglow.lovable.app`)
- **JSON-LD Organization + WebSite** עם `url` תקין, `inLanguage: "he"`, `sameAs` לרשתות חברתיות (אם יש), ו-`description` בעברית
- הוספת JSON-LD **`Store` / `OnlineStore`** עם `areaServed: IL`, `currenciesAccepted: ILS`

### B. `src/pages/ProductDetail.tsx` — תיקוני מטה לכל דף מוצר
- canonical + og:url ← `https://korean-glow-il.shop/...` (לא lovable.app)
- Title יכלול הביטוי `| טיפוח קוריאני | קוריאן גלואו`
- Meta description מבוסס על תיאור המוצר + ביטוי קטגוריה (קוסמטיקה קוריאנית / סרום / מסכה וכו')
- JSON-LD Product עם `brand: "קוריאן גלואו"`, `inLanguage: "he"`, `priceCurrency: "ILS"`

### C. `src/pages/Index.tsx` — Helmet ייעודי לדף הבית
הוספת `<Helmet>` שדורס את התגיות הסטטיות עם תוכן עברי עשיר בביטויים, כולל כותרות H1/H2 שמטמיעות את "טיפוח קוריאני" ו"קוסמטיקה קוריאנית" באופן טבעי.

### D. עמודי משנה (Blog / Contact / Shipping / Returns)
הוספת `<Helmet>` עם title/description/canonical ייעודיים בעברית הכוללים את ביטוי הליבה הרלוונטי.

### E. `public/sitemap.xml`
הרחבה ל-21+ כתובות: הקיימות (5) + 16 דפי מוצר. אחזק אותו ידנית בקובץ הסטטי (לא מתחיל לשנות את מנגנון הגנרציה ללא אישור).

### F. `public/robots.txt`
- ודא `Allow: /`
- הוספת `Sitemap: https://korean-glow-il.shop/sitemap.xml`

### G. `public/llms.txt`
עדכון לתיאור עברי קצר של החנות + ביטויי המפתח, לשיפור AI search.

---

## דברים שאני **לא** משנה ללא אישור נוסף
- עיצוב/קופי בדפים (זה SEO טכני בלבד; אם תרצה גם שכתוב כותרות וטקסטים בדף הבית/מוצר עם הביטויים — אגיש הצעה נפרדת).
- מנגנון יצירת sitemap (כרגע סטטי — אשאיר סטטי).

---

## מה אצטרך ממך לפני שאתחיל
1. אישור להתחבר ל-Shopify (כדי לשלוף את 16 המוצרים).
2. אישור לתוכנית הזו.

לאחר אישור — אבצע הכל בריצה אחת ואחזיר לך:
- טבלה של 16 כתובות מלאות
- סיכום של כל קובץ ששונה
