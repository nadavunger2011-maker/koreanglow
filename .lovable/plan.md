## הבעיה
ה-feed של Google Shopping מחזיר כיום קישורים ל-Shopify (`onlineStoreUrl`, למשל `koreanglow.co.il/en/products/...`) או ל-`/products/<handle>` בדומיין של האתר. שני המסלולים לא קיימים באתר שב-Lovable.

המסלול האמיתי באתר הוא `/product/:handle` (יחיד, לא `/products/`), והוא משתמש באותו `handle` של Shopify.

## השינוי
בקובץ `supabase/functions/google-merchant-feed/index.ts`, בפונקציה `buildXml`, להחליף את חישוב ה-`link` כך שתמיד יצביע לעמוד המוצר באתר Lovable, ולהתעלם מ-`onlineStoreUrl` של Shopify:

```ts
// לפני
const link = p.onlineStoreUrl ?? `${SITE_URL}/products/${p.handle}`;

// אחרי
const link = `${SITE_URL}/product/${p.handle}`;
```

`SITE_URL` כבר מוגדר ל-`https://www.korean-glow-il.shop` (הדומיין המותאם של הפרויקט), כך שהקישור יהיה למשל:
`https://www.korean-glow-il.shop/product/niacinamide-serum-10`

## אחרי הפריסה
- לפתוח מחדש את `…/functions/v1/google-merchant-feed` ולוודא שכל `<g:link>` מצביע ל-`/product/<handle>` בדומיין של האתר.
- ב-Google Merchant Center לבצע fetch מחדש של ה-feed כדי שהקישורים יתעדכנו.

ללא שינוי בכותרות המוצרים, ב-frontend, או בכל לוגיקה אחרת.