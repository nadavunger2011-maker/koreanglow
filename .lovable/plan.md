## Fix GA4 Ecommerce configuration in GTM container

Update `/mnt/documents/kbeauty-gtm-container.json` so GA4 ecommerce tags use native ecommerce reporting instead of manual parameter mapping.

### Scope
Applies only to standard GA4 ecommerce event tags:
- `view_item`
- `view_item_list`
- `select_item`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase` (if present)

Non-ecommerce tags (e.g. `page_view`, quiz events, CTA clicks, scroll, form events) are left unchanged.

### Changes per ecommerce tag
1. Set parameter `sendEcommerceData` → `"true"`.
2. Set parameter `ecommerceDataSource` → `"dataLayer"`.
3. Remove from `eventParameters` (the LIST of event params) any entries whose key is:
   - `items`
   - `value`
   - `currency`

   GA4 will pull these directly from the `ecommerce` object in the DataLayer.

4. Keep all other custom params (e.g. `item_list_name`, `coupon`, `shipping_tier`, `payment_type`, `transaction_id`) intact.

### Implementation
Write a Python script that:
1. Loads the JSON.
2. Iterates `containerVersion.tag[]`.
3. For tags whose `type == "gaawe"` (GA4 Event) and whose `eventName` parameter value is in the ecommerce list above:
   - Upserts `sendEcommerceData = "true"` (type `BOOLEAN`).
   - Upserts `ecommerceDataSource = "dataLayer"` (type `TEMPLATE`).
   - Filters the `eventParameters` LIST, removing map entries where `key == "items" | "value" | "currency"`.
4. Saves back with `indent=2`, preserving everything else.

### Out of scope
- No changes to triggers, variables, built-in variables, or the README.
- No application code changes — `src/lib/analytics.ts` already pushes `ecommerce` objects to the DataLayer correctly.

### Deliverable
Updated `/mnt/documents/kbeauty-gtm-container.json` ready to re-import into GTM.
