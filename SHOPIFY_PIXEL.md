# Shopify Customer Events Pixel — GA4 + Meta

הסיבה: צ'קאאוט של Shopify רץ על דומיין נפרד (`checkout.shopify.com` / `*.myshopify.com`), ולכן GTM של האתר הראשי לא יכול לתפוס בו אירועי `begin_checkout`, `add_payment_info` ו-`purchase`. הפתרון הרשמי הוא **Customer Events Pixel** בתוך Shopify Admin.

## איפה להדביק

Shopify Admin → **Settings** → **Customer events** → **Add custom pixel** → תן שם "GA4 + Meta Tracking" → הדבק את הקוד למטה → **Save** → **Connect**.

## הקוד

החלף את `G-XXXXXXXXXX` ב-Measurement ID של GA4 שלך, ואת `PIXEL_ID` ב-Meta Pixel ID (`2385386158636348` במקרה שלך).

```javascript
// === הגדרות ===
const GA4_MEASUREMENT_ID = 'G-GZ6X1ZZRZF';
const META_PIXEL_ID = '2385386158636348';

// helper: שולח hit ל-GA4 דרך Measurement Protocol (אין צורך ב-API Secret מהדפדפן —
// משתמשים ב-image pixel של GA4 המקבל את ה-client_id מה-cookie _ga)
function getClientId() {
  const m = document.cookie.match(/_ga=GA\d\.\d\.(.+?)(?:;|$)/);
  return m ? m[1] : (Date.now() + '.' + Math.floor(Math.random() * 1e10));
}

function ga4(eventName, params) {
  const cid = getClientId();
  const url = new URL('https://www.google-analytics.com/g/collect');
  url.searchParams.set('v', '2');
  url.searchParams.set('tid', GA4_MEASUREMENT_ID);
  url.searchParams.set('cid', cid);
  url.searchParams.set('en', eventName);
  if (params.currency) url.searchParams.set('cu', params.currency);
  if (params.value != null) url.searchParams.set('epn.value', String(params.value));
  if (params.transaction_id) url.searchParams.set('ep.transaction_id', params.transaction_id);
  (params.items || []).forEach((it, i) => {
    const p = 'pr' + (i + 1);
    url.searchParams.set(p, [
      'id' + (it.id || ''),
      'nm' + encodeURIComponent(it.name || ''),
      'pr' + (it.price || 0),
      'qt' + (it.quantity || 1),
    ].join('~'));
  });
  navigator.sendBeacon ? navigator.sendBeacon(url.toString()) : fetch(url.toString(), { mode: 'no-cors' });
}

function meta(eventName, data) {
  const url = 'https://www.facebook.com/tr/?' + new URLSearchParams({
    id: META_PIXEL_ID,
    ev: eventName,
    cd_value: String(data.value || ''),
    cd_currency: data.currency || 'ILS',
    noscript: '0',
  }).toString();
  navigator.sendBeacon ? navigator.sendBeacon(url) : fetch(url, { mode: 'no-cors' });
}

function mapItems(lines) {
  return (lines || []).map((l) => ({
    id: l.merchandise?.id || l.variant?.id,
    name: l.merchandise?.product?.title || l.title,
    price: l.cost?.totalAmount?.amount || l.finalLinePrice?.amount || 0,
    quantity: l.quantity || 1,
  }));
}

// === אירועים ===
analytics.subscribe('checkout_started', (e) => {
  const c = e.data?.checkout;
  const payload = {
    currency: c?.currencyCode || 'ILS',
    value: c?.totalPrice?.amount || 0,
    items: mapItems(c?.lineItems),
  };
  ga4('begin_checkout', payload);
  meta('InitiateCheckout', payload);
});

analytics.subscribe('payment_info_submitted', (e) => {
  const c = e.data?.checkout;
  ga4('add_payment_info', {
    currency: c?.currencyCode || 'ILS',
    value: c?.totalPrice?.amount || 0,
    items: mapItems(c?.lineItems),
  });
});

analytics.subscribe('checkout_completed', (e) => {
  const c = e.data?.checkout;
  const payload = {
    transaction_id: c?.order?.id || c?.token,
    currency: c?.currencyCode || 'ILS',
    value: c?.totalPrice?.amount || 0,
    items: mapItems(c?.lineItems),
  };
  ga4('purchase', payload);
  meta('Purchase', payload);
});

analytics.subscribe('product_viewed', (e) => {
  const v = e.data?.productVariant;
  if (!v) return;
  const payload = {
    currency: v.price?.currencyCode || 'ILS',
    value: v.price?.amount || 0,
    items: [{ id: v.id, name: v.product?.title, price: v.price?.amount, quantity: 1 }],
  };
  ga4('view_item', payload);
  meta('ViewContent', payload);
});
```

## בדיקה

1. Shopify Admin → Customer events → ודא שהפיקסל **Connected**.
2. בצע הזמנת בדיקה.
3. GA4 → **Realtime** → אמור להופיע אירוע `purchase` עם `transaction_id` ו-revenue.
4. Meta Events Manager → **Test Events** → ודא `Purchase` נכנס.

## אופציה חלופית: GTM ב-checkout.liquid

אם החנות שלך **Shopify Plus** — אפשר להדביק את ה-GTM Container Snippet ישירות ב-`checkout.liquid`. אחרת, ה-Customer Events Pixel למעלה היא הדרך היחידה.