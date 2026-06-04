
## רקע

הצ'קאאוט שלך רץ על `koreanglow.co.il/checkouts` (דומיין מותאם, לא `*.myshopify.com`), ויש לך GTM פעיל (`GTM-WM33G76P`). זה אומר שאפשר לעשות **גישה אחידה**: GTM אחד מנהל את כל האירועים — גם באתר וגם בצ'קאאוט — וכל האירועים מגיעים ל-GA4 ול-Meta Pixel דרך הטגים הקיימים שלך.

## מה אעדכן בקוד הפרויקט

### 1. `SHOPIFY_PIXEL.md` — שכתוב מלא
אחליף את הקוד הנוכחי (ששולח ישירות ל-Measurement Protocol) ב-**GTM Bridge Pixel**:
- טוען את `GTM-WM33G76P` בתוך סביבת Customer Events של Shopify
- מאזין ל-`checkout_started`, `payment_info_submitted`, `checkout_completed`, `product_viewed`, `cart_viewed`
- דוחף ל-`dataLayer` אירועי GA4 תקניים (`begin_checkout`, `add_payment_info`, `purchase`, `view_item`, `view_cart`) עם `ecommerce.items`, `value`, `currency`, `transaction_id`, `tax`, `shipping`
- היתרון: כל הקונפיגורציה (GA4, Meta, קונסנט) מנוהלת במקום אחד ב-GTM, בלי לקודד מחדש מזהים בכל פעם

### 2. `GTM_SETUP.md` — הרחבה
אוסיף:
- 2 טריגרים חדשים: `add_payment_info`, `purchase`
- 3 משתני DataLayer חדשים: `ecommerce.transaction_id`, `ecommerce.tax`, `ecommerce.shipping`
- המלצה לתג **GA4 Event גנרי יחיד** (Event Name = `{{ Event }}`) שתופס את כל 9 האירועים
- הוספת `koreanglow.co.il` ל-Linker Domains
- סעיף ייעודי "התקנה בצ'קאאוט" עם הוראות שלב-אחר-שלב לפיקסל ב-Shopify Admin
- סעיף Consent Mode — איך לסמן `analytics_storage` ב-GA4 Configuration Tag

### 3. בלי שינויי קוד אפליקציה
- `src/lib/analytics.ts` כבר תקין (דוחף ל-dataLayer)
- `src/lib/gaLinker.ts` כבר תקין (cross-domain)
- אין מה לשנות ב-`index.html` או ב-`SalesDashboard.tsx`

## קבצים שייגעו

- ✏️ `SHOPIFY_PIXEL.md` — שכתוב מלא
- ✏️ `GTM_SETUP.md` — הרחבה

## מה תצטרך לעשות אחרי

1. **Shopify Admin** → Settings → Customer events → Add custom pixel → הדבק את הקוד החדש מ-`SHOPIFY_PIXEL.md` → Connect
2. **GTM** (workspace `GTM-WM33G76P`):
   - הוסף 6 DataLayer Variables, 9 Custom Event Triggers, ותג GA4 Event גנרי אחד (לפי `GTM_SETUP.md`)
   - הוסף `koreanglow.co.il` ל-Linker Domains ב-GA4 Configuration
   - סמן `analytics_storage` ב-Consent Settings של ה-Configuration Tag
   - **Publish** את ה-workspace
3. **בדיקה**: GTM Preview → רכישת בדיקה → ודא ב-GA4 DebugView שכל האירועים מגיעים

מאשר?
