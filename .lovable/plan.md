## Google Search Console — אימות והוספה

### מצב נוכחי
- תג האימות החדש (`UhnbA-99PnLv6nIwGKhoYbYmGGmqKAN00dwe15RblF8`) כבר נוסף ל-`index.html`, יחד עם canonical/og:url ל-`https://korean-glow-il.shop/`.
- `sitemap.xml` ו-`robots.txt` עודכנו לדומיין הראשי.
- כדי שגוגל יוכל לראות את התג, האתר חייב להיות **מפורסם** עם הגרסה האחרונה.

### שלבים שאבצע במצב Build
1. **בדיקת לייב** — `curl https://korean-glow-il.shop/` ולוודא שהתג החדש מופיע. אם לא — לעצור ולבקש פרסום.
2. **אימות מול Google** — קריאה ל-`siteVerification/v1/webResource?verificationMethod=META` עם `identifier=https://korean-glow-il.shop/`.
3. **הוספת ה-property ל-Search Console** — `PUT /webmasters/v3/sites/https%3A%2F%2Fkorean-glow-il.shop%2F`.
4. **הגשת ה-sitemap** — `PUT /webmasters/v3/sites/https%3A%2F%2Fkorean-glow-il.shop%2F/sitemaps/https%3A%2F%2Fkorean-glow-il.shop%2Fsitemap.xml`.
5. **אישור** — קריאת `GET /sites` ו-`GET /sitemaps` כדי לוודא שהכל נרשם.

### דרישה ממך לפני שאתחיל
האם פרסמת את הגרסה האחרונה ל-`korean-glow-il.shop`? אם כן — אאשר ואבצע. אם לא — צריך ללחוץ Publish קודם, אחרת Google יחזיר `failedToFindMetaTag`.