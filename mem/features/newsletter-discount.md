---
name: Newsletter discount flow
description: Lead capture popup that activates sitewide 10% discount mode and syncs to Flashy
type: feature
---
- Popup collects name+email → inserts to `leads` table.
- On success: localStorage flag `kg_discount_active` set, popup shows code WELCOME10 + "10% הנחה פעילה".
- Sitewide DiscountBanner reads flag and shows sticky top banner with code + copy button.
- Backend edge function `sync-shopify-customer` creates a Shopify customer with marketing consent (single_opt_in) and tags `newsletter-popup, welcome10`. Flashy syncs automatically via its native Shopify connection — no separate Flashy API key needed.
- Requires secrets: `SHOPIFY_SHOP_DOMAIN` (xxx.myshopify.com), `SHOPIFY_ACCESS_TOKEN` (Admin API, scope `write_customers`).