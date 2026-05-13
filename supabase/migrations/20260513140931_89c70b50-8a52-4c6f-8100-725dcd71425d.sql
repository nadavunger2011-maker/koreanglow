
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_blocks jsonb not null default '[]'::jsonb,
  cover_image_url text,
  cover_image_alt text,
  category text,
  tags text[] not null default '{}',
  meta_title text,
  meta_description text,
  keywords text[] not null default '{}',
  author_name text,
  read_minutes int,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_blog_posts_published on public.blog_posts (published, published_at desc);
create index idx_blog_posts_slug on public.blog_posts (slug);

alter table public.blog_posts enable row level security;

create policy "Public can view published posts"
on public.blog_posts for select
to anon, authenticated
using (published = true);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.update_updated_at_column();

create table public.blog_post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  session_id text,
  referrer text,
  path text,
  viewed_at timestamptz not null default now()
);

create index idx_blog_post_views_post on public.blog_post_views (post_id, viewed_at desc);

alter table public.blog_post_views enable row level security;

create policy "Anyone can record a view"
on public.blog_post_views for insert
to anon, authenticated
with check (post_id is not null);
