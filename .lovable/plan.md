## Goal
Make `/product/:handle?variant=<variantId>` resolve the product by **variant ID** (not the handle), and silently correct the URL if the handle doesn't match. The handle becomes a cosmetic SEO slug; the variant ID is the source of truth.

## Changes

### 1. `src/lib/shopify.ts` — add variant lookup
Add a new Storefront API helper:
```ts
export async function fetchProductByVariantId(variantId: string)
```
Uses the `node(id: $id)` query with `... on ProductVariant { product { ...full product fields... } selectedOptions }`. Accepts either a raw numeric ID (e.g. `48061220225279`) or a full GID; if numeric, wraps as `gid://shopify/ProductVariant/<id>`. Returns `{ product, variantGid }` or `null`.

### 2. `src/pages/ProductDetail.tsx` — variant-first resolution
- Read `variant` from `useSearchParams()` in addition to `handle` from `useParams()`.
- Resolution order in the load effect:
  1. If `variant` param exists → call `fetchProductByVariantId(variant)`. On success, set product, preselect that variant, and if `product.handle !== handle` call `navigate(`/product/${product.handle}?variant=${variant}`, { replace: true })` so no 404 fires and history is clean.
  2. Else → existing `fetchProductByHandle(handle)` path.
- When the user switches variants via the option buttons, update the URL param with `setSearchParams({ variant: rawId }, { replace: true })` so the page is shareable.
- Strip the `gid://shopify/ProductVariant/` prefix when writing to the URL (keep it short/numeric, matching the user's example).

### 3. Route stays the same
`/product/:handle` in `App.tsx` is unchanged; the catch-all `*` only fires when React Router has no match — since we always have a handle segment, no 404 will trigger during the silent redirect.

## Notes
- Pure frontend change; no DB/Shopify schema work.
- Existing handle-based links keep working.
- Links with only `?variant=...` and a stale/placeholder handle (e.g. `/product/x?variant=48061220225279`) will load correctly and self-heal the URL.
