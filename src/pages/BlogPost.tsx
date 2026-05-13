import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BlogContent, type Block } from "@/components/blog/BlogContent";
import { RecommendedSidebar } from "@/components/blog/RecommendedSidebar";
import { getSessionId, pushReadingHistory } from "@/lib/readingHistory";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_blocks: Block[];
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  author_name: string | null;
  read_minutes: number | null;
  published: boolean;
  published_at: string | null;
};

const VIEW_TRACK_KEY = (slug: string) => `koreanglow:viewed:${slug}`;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setNotFound(true);
        } else {
          const p = data as unknown as Post;
          setPost(p);
          // Track view (debounced once per hour per session per slug)
          const last = Number(localStorage.getItem(VIEW_TRACK_KEY(slug)) || 0);
          if (Date.now() - last > 60 * 60 * 1000) {
            localStorage.setItem(VIEW_TRACK_KEY(slug), String(Date.now()));
            supabase.from("blog_post_views").insert({
              post_id: p.id,
              session_id: getSessionId(),
              referrer: document.referrer || null,
              path: window.location.pathname,
            });
          }
          pushReadingHistory({
            slug: p.slug,
            category: p.category,
            tags: p.tags || [],
            ts: Date.now(),
          });
        }
        setLoading(false);
        window.scrollTo(0, 0);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  if (notFound || !post) return <Navigate to="/blog" replace />;

  const url = `https://koreanglow.lovable.app/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    author: post.author_name
      ? { "@type": "Person", name: post.author_name }
      : { "@type": "Organization", name: "Koreanglow" },
    publisher: {
      "@type": "Organization",
      name: "Koreanglow",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: (post.keywords || []).join(", ") || undefined,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://koreanglow.lovable.app/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://koreanglow.lovable.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>{post.meta_title || `${post.title} | Koreanglow`}</title>
        <meta name="description" content={post.meta_description || post.excerpt || ""} />
        {(post.keywords || []).length > 0 && (
          <meta name="keywords" content={(post.keywords || []).join(", ")} />
        )}
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ""} />
        <meta property="og:url" content={url} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            לכל המאמרים
          </Link>
          <Link to="/" className="text-sm font-bold">Koreanglow</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr,300px] gap-12">
          <article>
            {post.category && (
              <p className="text-xs uppercase tracking-widest text-primary mb-3">{post.category}</p>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8">
              {post.author_name && <span>{post.author_name}</span>}
              {post.published_at && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.published_at).toLocaleDateString("he-IL")}
                </span>
              )}
              {post.read_minutes && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  {post.read_minutes} דק׳
                </span>
              )}
            </div>
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.cover_image_alt || post.title}
                className="w-full rounded-xl border border-border/40 mb-10 aspect-[16/9] object-cover"
              />
            )}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 font-light italic">
                {post.excerpt}
              </p>
            )}
            <BlogContent blocks={Array.isArray(post.content_blocks) ? post.content_blocks : []} />

            {(post.tags || []).length > 0 && (
              <div className="mt-12 pt-6 border-t border-border/40 flex flex-wrap gap-2">
                {(post.tags || []).map((t) => (
                  <span key={t} className="text-xs bg-muted px-3 py-1 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          <RecommendedSidebar currentSlug={post.slug} />
        </div>
      </main>
    </div>
  );
};

export default BlogPost;