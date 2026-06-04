תיקון שתי בעיות שעלו בדשבורד:

## 1. Search Console מציג נכס שגוי

הפונקציה `gsc-analytics` בוחרת אוטומטית את הנכס הראשון המאומת מתוך הרשימה — ולחשבון שלך יש 24 נכסים, אז היא תופסת אחד של לקוח אחר במקום של החנות.

הנכס הנכון בחשבונך: `https://korean-glow-il.shop/` (siteOwner).

**מה אתקן:**
- ב-`SalesDashboard.tsx` אוסיף סלקטור נכסים (Dropdown) בראש פאנל ה-SEO שמושך את רשימת הנכסים המאומתים ומציג את שמותיהם, עם בחירה ברירת מחדל ל-`https://korean-glow-il.shop/`.
- הבחירה תישמר ב-`localStorage` (`kg_gsc_site`) כדי שתישאר בין רענונים.
- ב-`gsc-analytics`:
  - אוסיף endpoint חדש `?action=list-sites` שמחזיר רק נכסים שאתה owner/fullUser בהם.
  - הפונקציה הראשית תקבל `siteUrl` מהבקשה ותעדיף אותו על פני האוטו-בחירה.
  - אם לא הועבר כלום — fallback ל-`https://korean-glow-il.shop/`.

## 2. אירועי איקומרס לא נשלחים מהצ'קאאוט של Shopify

מצב נוכחי:
- `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `select_item`, `remove_from_cart`, `view_item_list` — **כבר נשלחים** מהאתר ל-`dataLayer` (ראה `src/lib/analytics.ts`).
- **הם לא מגיעים ל-GA4** כי:
  1. Consent Mode v2 כברירת מחדל ב-denied — GTM/GA4 לא שולחים אירועי `analytics_storage` עד שהמשתמש מאשר ב-Cookie Banner.
  2. ב-GTM שלך (GTM-WM33G76P) צריך טריגרים מסוג Custom Event לכל אירוע (`view_item`, `add_to_cart` וכו') שמפעילים תג GA4 Event עם פרמטרי `{{ DLV - ecommerce }}`. ייתכן שאין שם תגיות כאלה כרגע — אבדוק במסמך הוראות GTM שאשלח לך.
- **`purchase`** ו-`begin_checkout` בפועל ב-Shopify Checkout (דומיין `v9zwr2-ge.myshopify.com` / `checkout.shopify.com`) **לא נשלחים בכלל** כי GTM של החנות שלך לא מותקן בצ'קאאוט של Shopify — צ'קאאוט הוא דומיין נפרד שדורש התקנה ייעודית.

**מה אתקן:**

### א. תיקון אירועים בצד הסטורפרונט (האתר שלך)
- אוסיף לוג קצר (`console.debug('[GA4 EVENT]', ...)`) ב-`src/lib/analytics.ts` כדי שתוכל לוודא בקונסול שהאירועים נורים בפועל.
- אכין מסמך `GTM_SETUP.md` עם רשימה מדויקת של:
  - 7 Custom Event Triggers (`view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `select_item`, `remove_from_cart`, `view_item_list`)
  - DataLayer Variables (`ecommerce.value`, `ecommerce.currency`, `ecommerce.items`)
  - 7 GA4 Event Tags שצריך להגדיר עם פרמטר `items` כ-Event Parameter
  - איך לבדוק עם GA4 DebugView

### ב. שליחת `purchase` ו-`begin_checkout` מ-Shopify Checkout
שתי דרכים — אתן לך את הקוד המוכן של שתיהן ותבחר:

**אפשרות 1 (מומלצת — Shopify Customer Events Pixel):**
- אספק קוד JavaScript מוכן שתדביק ב-Shopify Admin → Settings → Customer Events → Add Custom Pixel.
- הפיקסל יאזין לאירועי Shopify הסטנדרטיים (`checkout_started`, `checkout_completed`, `payment_info_submitted`) וישלח אותם ישירות ל-GA4 דרך Measurement Protocol עם `client_id` שמתואם לאתר שלך, וגם יזרוק `purchase` ל-Meta Pixel.

**אפשרות 2 (GTM Container בצ'קאאוט של Shopify):**
- הוראות איך להוסיף את ה-GTM Container `GTM-WM33G76P` ל-`checkout.liquid` של Shopify (דורש Shopify Plus או "Additional Scripts" בהגדרות הצ'קאאוט).

### ג. Cross-domain tracking
- הקובץ `src/lib/gaLinker.ts` כבר מצרף את `_ga` ל-URL של הצ'קאאוט (טוב).
- אוסיף את הדומיין `v9zwr2-ge.myshopify.com` למסמך ה-GTM כדי לוודא ש-GA4 Configuration Tag כולל אותו ב-`linker.domains`.

## קבצים שייגעו

- ✏️ `supabase/functions/gsc-analytics/index.ts` — תמיכה ב-`siteUrl` ו-`action=list-sites`
- ✏️ `src/components/admin/SalesDashboard.tsx` — סלקטור נכס SEO
- ✏️ `src/lib/analytics.ts` — debug log
- ➕ `GTM_SETUP.md` — מסמך הוראות
- ➕ `SHOPIFY_PIXEL.md` — קוד Customer Events Pixel מוכן להדבקה

## מה שאצטרך ממך אחרי שאסיים

1. להדביק את קוד הפיקסל ב-Shopify Admin (אני אנחה אותך צעד-צעד).
2. להוסיף את התגיות וה-triggers ב-GTM לפי המסמך — או, אם תרצה, אעשה את זה דרך כלי MCP אם יש לך חיבור Google Tag Manager.

מאשר?