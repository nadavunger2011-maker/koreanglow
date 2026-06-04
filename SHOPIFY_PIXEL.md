# Shopify Customer Events Pixel — GTM Bridge

## למה גשר GTM?

הצ'קאאוט של החנות רץ על `koreanglow.co.il/checkouts` (Checkout Extensibility של Shopify), בסביבת iframe נפרדת מהאתר הראשי. GTM של האתר (`GTM-WM33G76P`) לא נטען שם אוטומטית — לכן נטען אותו ידנית בתוך **Customer Events Pixel** של Shopify, ונדחוף אליו אירועי איקומרס תקניים של GA4. כל הקונפיגורציה (GA4, Meta Pixel, Consent Mode) נשארת ב-GTM — מקום אחד לנהל את הכל.

## איפה להדביק

Shopify Admin → **Settings** → **Customer events** → **Add custom pixel**
- שם: `GTM Bridge`
- Permission: **Not required** (GTM מנהל קונסנט בעצמו)
- הדבק את הקוד למטה → **Save** → **Connect**

## הקוד

```javascript
// === טעינת GTM בתוך סביבת ה-Customer Event ===
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s);
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-WM33G76P');

// === Helpers ===
const numericId = (gid) => (gid ? String(gid).split('/').pop() : '');

const mapItems = (lines) =>
  (lines || []).map((l, idx) => ({
    item_id: numericId(l.merchandise?.id || l.variant?.id),
    item_name: l.merchandise?.product?.title || l.title,
    item_variant: l.merchandise?.title,
    price: Number(l.cost?.totalAmount?.amount || l.finalLinePrice?.amount || 0),
    quantity: l.quantity || 1,
    index: idx,
  }));

const pushEvent = (event, ecommerce) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
};

// === אירועי Shopify → dataLayer ===
analytics.subscribe('checkout_started', (e) => {
  const c = e.data?.checkout;
  pushEvent('begin_checkout', {
    currency: c?.currencyCode || 'ILS',
    value: Number(c?.totalPrice?.amount || 0),
    items: mapItems(c?.lineItems),
  });
});

analytics.subscribe('payment_info_submitted', (e) => {
  const c = e.data?.checkout;
  pushEvent('add_payment_info', {
    currency: c?.currencyCode || 'ILS',
    value: Number(c?.totalPrice?.amount || 0),
    items: mapItems(c?.lineItems),
  });
});

analytics.subscribe('checkout_completed', (e) => {
  const c = e.data?.checkout;
  pushEvent('purchase', {
    transaction_id: c?.order?.id ? numericId(c.order.id) : c?.token,
    currency: c?.currencyCode || 'ILS',
    value: Number(c?.totalPrice?.amount || 0),
    tax: Number(c?.totalTax?.amount || 0),
    shipping: Number(c?.shippingLine?.price?.amount || 0),
    items: mapItems(c?.lineItems),
  });
});

analytics.subscribe('cart_viewed', (e) => {
  const c = e.data?.cart;
  pushEvent('view_cart', {
    currency: c?.cost?.totalAmount?.currencyCode || 'ILS',
    value: Number(c?.cost?.totalAmount?.amount || 0),
    items: mapItems(c?.lines),
  });
});

analytics.subscribe('product_viewed', (e) => {
  const v = e.data?.productVariant;
  if (!v) return;
  pushEvent('view_item', {
    currency: v.price?.currencyCode || 'ILS',
    value: Number(v.price?.amount || 0),
    items: [
      {
        item_id: numericId(v.id),
        item_name: v.product?.title,
        item_variant: v.title,
        price: Number(v.price?.amount || 0),
        quantity: 1,
      },
    ],
  });
});
```

## בדיקה

1. Shopify Admin → Customer events → ודא שהפיקסל **Connected**.
2. GTM → **Preview** → טען את `https://koreanglow.co.il` ובצע הזמנת בדיקה מלאה.
3. ב-Tag Assistant תראה את ה-Container עולה גם בצ'קאאוט (iframe נפרד) ויורה את הטגים `begin_checkout` → `add_payment_info` → `purchase`.
4. GA4 → **Admin → DebugView** — כל האירועים צריכים להגיע עם `items`, `value`, `currency`, ו-`transaction_id` ברכישה.
5. Meta Events Manager → **Test Events** — אם יצרת ב-GTM תג Meta Pixel על הטריגר `purchase`, גם הוא יופיע.

## הערות

- אין צורך ב-Measurement ID או Meta Pixel ID בתוך הקוד — הם מוגדרים פעם אחת בטגים של GTM.
- אם מותקן Cookie Banner שמשתמש ב-Consent Mode v2, ודא ש-GA4 Configuration Tag מסומן עם `analytics_storage` ב-Consent Settings, אחרת אירועים יחסמו עד אישור.
- Meta Pixel בצ'קאאוט: עדיף להוסיף ב-GTM **תג Meta Pixel** עם טריגרים על `purchase`/`begin_checkout` (event name `Purchase`/`InitiateCheckout`) במקום לקודד ידנית כאן.