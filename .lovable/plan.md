## Overview
Build a dynamic, editorial-style blog for Koreanglow with shoppable Shopify product cards inline, per-route SEO + Article schema, view analytics surfaced in `/admin-dashboard`, and a client-side "Recommended for you" sidebar driven by reading history.

Reuses existing auth (only `nadavunger2011@gmail.com`), the existing `cartStore` + Storefront API helper, and Koreanglow's minimalist RTL aesthetic.

---

## 1. Database (one migration)

New tables, all in `public`:

- `blog_posts`
  - `id uuid pk`, `slug text unique not null`, `title text not null`
  - `excerpt text`, `content_blocks jsonb not null default '[]'` — ordered blocks: `{type:"h2"|"p"|"image"|"quote"|"product", ...}` where `product` blocks store `{handle}` (resolved at render time via Storefront API)
  - `cover_image_url text`, `cover_image_alt text`
  - `category text`, `tags text[]`
  - `meta_title text`, `meta_description text`, `keywords text[]`
  - `author_name text`, `read_minutes int`
  - `published boolean default false`, `published_at timestamptz`
  - `created_at`, `updated_at timestamptz`

- `blog_post_views`
  - `id uuid pk`, `post_id uuid references blog_posts(id) on delete cascade`
  - `viewed_at timestamptz default now()`
  - `session_id text` (anonymous client-generated UUID stored in localStorage)
  - `referrer text`, `path text`

RLS:
- `blog_posts`: anon/authenticated `SELECT` only `WHERE published = true`. No public writes (admin uses service role via edge function).
- `blog_post_views`: anon/authenticated `INSERT` allowed (with a basic check that `post_id` is not null). No public `SELECT` — admin reads aggregated views via edge function.
- `updated_at` trigger on `blog_posts`.

---

## 2. Edge function changes

Extend the existing `admin-data` function (already JWT-protected) with a small action router:

- `?resource=posts` → `GET` list (incl. drafts), `POST` upsert, `DELETE` by id
- `?resource=analytics` → `GET` returns per-post view counts (last 7d / 30d / all) by joining `blog_post_views` + `blog_posts`

No new public function — public reads/inserts go through the supabase client (RLS allows).

---

## 3. Public blog UI

New routes added in `src/App.tsx`:
- `/blog` → `src/pages/Blog.tsx` — editorial index with featured hero post + grid.
- `/blog/:slug` → `src/pages/BlogPost.tsx` — article layout.

Components:
- `src/components/blog/BlogContent.tsx` — renders `content_blocks` in order with semantic tags (one `<h1>` for title, `<h2>` for sections, `<p>`, `<figure>`, `<blockquote>`).
- `src/components/blog/ShoppableProductCard.tsx` — given a Shopify product handle, fetches the product via `storefrontApiRequest` (single-product query by handle), renders image + title + price + "הוסיפי לעגלה" button that uses the existing `useCartStore.addItem` flow. Strictly no manual checkout URLs.
- `src/components/blog/RecommendedSidebar.tsx` — reads `localStorage.koreanglow:reading_history` (array of `{slug, category, tags, ts}`), scores other published posts by category/tag overlap, falls back to most-recent if history is empty. Sticky on desktop, collapsible carousel on mobile.
- `src/components/blog/ArticleSchema.tsx` — emits JSON-LD `Article` + `BreadcrumbList`.

SEO:
- Install `react-helmet-async`; wrap app in `<HelmetProvider>` in `src/main.tsx`.
- `<BlogPost>` uses `<Helmet>` for `<title>`, meta description, canonical, `og:*`, and the JSON-LD script tag.
- Remove `<link rel="canonical">` from `index.html` to avoid double-canonical.

View tracking:
- `BlogPost` records a view on mount: ensures a `session_id` in localStorage, then `supabase.from('blog_post_views').insert({...})`. Debounced per session+slug+hour to avoid spam. Also pushes to local reading history.

---

## 4. Admin dashboard additions

Refactor `src/pages/AdminDashboard.tsx` to use `Tabs`: **Leads** (existing), **Marketing** (existing), **Blog**, **Analytics**.

- **Blog tab** (`src/components/admin/BlogManager.tsx`):
  - Table of all posts (draft + published), with edit/delete, publish toggle.
  - Editor dialog with all `blog_posts` fields plus a block editor for `content_blocks` (add H2 / Paragraph / Image / Quote / Shoppable Product by handle, drag-to-reorder via simple up/down buttons).
  - Live SEO mini-checklist (title length, meta length, has cover alt, ≥1 H2, ≥1 paragraph) shown beside the editor.

- **Analytics tab** (`src/components/admin/BlogAnalytics.tsx`):
  - Sortable table of posts ranked by views (7d / 30d / all toggle).
  - Top 5 posts shown as a simple bar chart using existing `chart.tsx` (Recharts).

---

## 5. Technical details

- New deps: `react-helmet-async`. (Block content stored as JSON, no markdown lib needed.)
- Shoppable card reuses `src/lib/shopify.ts` + `useCartStore.addItem` — full GraphQL variant IDs, lineId tracking, `channel=online_store` on checkout URL (already enforced in store).
- Reading history capped to last 20 entries, never sent to the server (privacy-friendly).
- All copy in Hebrew, RTL preserved; styling via existing semantic tokens (no hard-coded colors).

---

## File changes

```text
NEW:
  supabase/migrations/<ts>_blog.sql
  src/pages/Blog.tsx
  src/pages/BlogPost.tsx
  src/components/blog/BlogContent.tsx
  src/components/blog/ShoppableProductCard.tsx
  src/components/blog/RecommendedSidebar.tsx
  src/components/blog/ArticleSchema.tsx
  src/components/admin/BlogManager.tsx
  src/components/admin/BlogAnalytics.tsx
  src/lib/readingHistory.ts

EDIT:
  supabase/functions/admin-data/index.ts   (add posts + analytics resources)
  src/pages/AdminDashboard.tsx             (new tabs)
  src/App.tsx                              (blog routes)
  src/main.tsx                             (HelmetProvider)
  index.html                               (drop canonical link)
  package.json                             (react-helmet-async)
```

Approve and I'll implement in order: migration → edge function → public blog → admin tabs.
