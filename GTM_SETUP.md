# GTM Setup — Koreanglow (GTM-WM33G76P)

האתר וה-Customer Events Pixel בצ'קאאוט שולחים אירועי איקומרס תקניים ל-`dataLayer`. כדי ש-GA4 יקבל אותם, יש להגדיר ב-GTM:

## 1. Variables (DataLayer Variables)

| Name | Data Layer Variable Name | Version |
|---|---|---|
| DLV - ecommerce.value | `ecommerce.value` | 2 |
| DLV - ecommerce.currency | `ecommerce.currency` | 2 |
| DLV - ecommerce.items | `ecommerce.items` | 2 |
| DLV - ecommerce.transaction_id | `ecommerce.transaction_id` | 2 |
| DLV - ecommerce.tax | `ecommerce.tax` | 2 |
| DLV - ecommerce.shipping | `ecommerce.shipping` | 2 |
| DLV - item_list_id | `ecommerce.item_list_id` | 2 |
| DLV - item_list_name | `ecommerce.item_list_name` | 2 |

## 2. Triggers (Custom Event)

יש ליצור Trigger מסוג **Custom Event** עבור כל אחד מהאירועים:

`view_item`, `view_item_list`, `select_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_payment_info`, `purchase`

## 3. GA4 Event Tag (גנרי — מומלץ)

במקום ליצור 9 תגים, צור **תג אחד גנרי** שמשתמש במשתנה Built-in `{{ Event }}`:

- Tag Type: **Google Analytics: GA4 Event**
- Configuration Tag: ה-GA4 Configuration שלך
- Event Name: `{{ Event }}`
- Event Parameters:
  - `currency` → `{{ DLV - ecommerce.currency }}`
  - `value` → `{{ DLV - ecommerce.value }}`
  - `items` → `{{ DLV - ecommerce.items }}`
  - `transaction_id` → `{{ DLV - ecommerce.transaction_id }}`
  - `tax` → `{{ DLV - ecommerce.tax }}`
  - `shipping` → `{{ DLV - ecommerce.shipping }}`
- Triggers: כל 9 ה-Custom Events מסעיף 2

(אם פרמטר ריק — GA4 פשוט יתעלם ממנו, אז זה בטוח להגדיר את כולם בתג אחד.)

## 4. Cross-Domain Linker

ב-GA4 Configuration Tag → **Fields to Set** או **Configuration Settings**:

- `linker` → `domains` → `korean-glow-il.shop, www.korean-glow-il.shop, koreanglow.co.il, koreanglow.lovable.app, v9zwr2-ge.myshopify.com`

## 5. Consent Mode

האתר משתמש ב-Google Consent Mode v2 (`analytics_storage` כברירת מחדל `denied`). אירועים יישלחו ל-GA4 רק אחרי שהמשתמש מאשר ב-Cookie Banner.

ב-GA4 Configuration Tag (וגם בתג GA4 Event הגנרי) → **Advanced Settings → Consent Settings** → **Require additional consent for tag to fire** → סמן `analytics_storage`. בלי זה, אירועים בצ'קאאוט יחסמו גם אחרי שהלקוח אישר.

## 6. התקנה בצ'קאאוט של Shopify

הצ'קאאוט (`koreanglow.co.il/checkouts`) רץ בסביבה נפרדת — GTM לא נטען שם אוטומטית. כדי לשלוח ממנו אירועי `begin_checkout`, `add_payment_info` ו-`purchase`:

1. עקוב אחרי `SHOPIFY_PIXEL.md` — הדבק את ה-GTM Bridge Pixel ב-**Shopify Admin → Settings → Customer events → Add custom pixel**.
2. הפיקסל יטען את `GTM-WM33G76P` בתוך הצ'קאאוט וידחוף את האירועים ל-`dataLayer` באותו פורמט כמו האתר הראשי.
3. אותם 9 טריגרים + תג GA4 הגנרי יתפסו אותם — אין צורך בקונפיגורציה כפולה.

## 7. Meta Pixel (אופציונלי, מומלץ)

אם תרצה ש-Meta Pixel ירוץ גם בצ'קאאוט, הוסף ב-GTM:
- Tag Type: **Custom HTML** או **Meta Pixel Template** (מ-Community Gallery)
- Pixel ID: `2385386158636348`
- Triggers: `purchase` (Event Name: `Purchase`), `begin_checkout` (Event Name: `InitiateCheckout`), `add_to_cart` (Event Name: `AddToCart`), `view_item` (Event Name: `ViewContent`)

## 8. בדיקה

1. פתח את האתר עם `?gtm_debug=1` או הפעל את Tag Assistant.
2. הוסף מוצר לסל — אמור להופיע `add_to_cart` עם `items` מאוכלס.
3. עבור לצ'קאאוט והשלם הזמנת בדיקה — Tag Assistant יראה container חדש שעולה בצ'קאאוט עם `begin_checkout` → `add_payment_info` → `purchase`.
4. ב-GA4 → DebugView ודא שכל האירועים מגיעים (יש לאשר Cookie Banner קודם).
5. בקונסול תראה `[GA4] add_to_cart {...}` (מופיע ב-dev או עם `?ga_debug=1`).
6. GA4 → **Reports → Realtime** → צריך לראות `purchase` תוך שניות ועם `transaction_id` ו-revenue.