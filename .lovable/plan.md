## תיקון קובץ ה-GTM Container

**הבעיה שאותרה:**
ב-GTM Container JSON, השדה `type` ב-`builtInVariable` חייב להיות באותיות גדולות (UPPERCASE enum). הקובץ הנוכחי משתמש ב-camelCase:
- `pageUrl` → צריך `PAGE_URL`
- `pageHostname` → `PAGE_HOSTNAME`
- `pagePath` → `PAGE_PATH`
- `referrer` → `REFERRER`
- `event` → `EVENT`

זה גורם לשגיאה: *"Error deserializing enum type [Type]. Unrecognized value [template]"* (ה-parser נופל ברגע שהוא מנסה לפענח את ה-enum).

**מה אעשה:**
1. אעדכן את סקריפט הגנרציה ואייצר מחדש את `/mnt/documents/kbeauty-gtm-container.json` עם ערכי UPPERCASE נכונים לכל ה-built-in variables.
2. אוודא שכל שאר ה-enum-ים תקינים (tag types, variable types, trigger types).
3. אבדוק את הקובץ עם validation בסיסי לפני מסירה.
4. ה-README נשאר כפי שהוא — שלבי הייבוא לא משתנים.

**מחוץ לסקופ:**
שינויים בקוד האפליקציה (ה-`pushEvent` והאירועים כבר עובדים מהאיטרציה הקודמת).