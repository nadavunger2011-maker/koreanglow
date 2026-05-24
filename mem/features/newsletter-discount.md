---
name: Newsletter discount flow
description: Lead capture popup that activates sitewide 10% discount mode and syncs to Flashy
type: feature
---
- Popup collects name+email → inserts to `leads` table.
- On success: localStorage flag `kg_discount_active` set, popup shows code WELCOME10 + "10% הנחה פעילה".
- Sitewide DiscountBanner reads flag and shows sticky top banner with code + copy button.
- Backend edge function `sync-flashy-lead` forwards lead to Flashy API using FLASHY_API_KEY secret.