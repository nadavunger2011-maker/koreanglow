# GTM Setup — Koreanglow (GTM-WM33G76P)

האתר כבר שולח אירועי איקומרס תקניים ל-`dataLayer`. כדי ש-GA4 יקבל אותם, יש להגדיר ב-GTM:

## 1. Variables (DataLayer Variables)

| Name | Data Layer Variable Name | Version |
|---|---|---|
| DLV - ecommerce.value | `ecommerce.value` | 2 |
| DLV - ecommerce.currency | `ecommerce.currency` | 2 |
| DLV - ecommerce.items | `ecommerce.items` | 2 |
| DLV - item_list_id | `ecommerce.item_list_id` | 2 |
| DLV - item_list_name | `ecommerce.item_list_name` | 2 |

## 2. Triggers (Custom Event)

יש ליצור Trigger מסוג **Custom Event** עבור כל אחד מהאירועים:

`view_item`, `view_item_list`, `select_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`

## 3. GA4 Event Tags

תג אחד לכל אירוע (או תג אחד עם Event Name מ-`{{ Event }}`):

- Tag Type: **Google Analytics: GA4 Event**
- Configuration Tag: ה-GA4 Configuration שלך
- Event Name: שם האירוע (למשל `add_to_cart`)
- Event Parameters:
  - `currency` → `{{ DLV - ecommerce.currency }}`
  - `value` → `{{ DLV - ecommerce.value }}`
  - `items` → `{{ DLV - ecommerce.items }}`
- Trigger: ה-Custom Event המתאים

## 4. Cross-Domain Linker

ב-GA4 Configuration Tag → **Fields to Set** או **Configuration Settings**:

- `linker` → `domains` → `korean-glow-il.shop, www.korean-glow-il.shop, koreanglow.lovable.app, v9zwr2-ge.myshopify.com`

## 5. Consent Mode

האתר משתמש ב-Google Consent Mode v2 (`analytics_storage` כברירת מחדל `denied`). אירועים יישלחו ל-GA4 רק אחרי שהמשתמש מאשר ב-Cookie Banner.

## 6. בדיקה

1. פתח את האתר עם `?gtm_debug=1` או הפעל את Tag Assistant.
2. הוסף מוצר לסל — אמור להופיע `add_to_cart` עם `items` מאוכלס.
3. ב-GA4 → DebugView ודא שהאירוע מגיע (יש לאשר Cookie Banner קודם).
4. בקונסול תראה `[GA4] add_to_cart {...}` (מופיע ב-dev או עם `?ga_debug=1`).