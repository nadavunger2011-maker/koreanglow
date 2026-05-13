import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, cover_image_alt, category, read_minutes, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>הבלוג של Koreanglow — טיפים לעור זוהר</title>
        <meta
          name="description"
          content="כל מה שצריך לדעת על שגרת K-Beauty, גלאס סקין וטיפוח קוריאני — מאמרים, מדריכים והמלצות מוצרים."
        />
        <link rel="canonical" href="https://koreanglow.lovable.app/blog" />
        <meta property="og:title" content="הבלוג של Koreanglow" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Koreanglow Blog",
          url: "https://koreanglow.lovable.app/blog",
        })}</script>
      </Helmet>

      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            חזרה לחנות
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Koreanglow Journal</h1>
          <span className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" size={28} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">עוד אין מאמרים — חזרי בקרוב.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link to={`/blog/${featured.slug}`} className="block group mb-16">
                <Card className="overflow-hidden border-border/40">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featured.cover_image_url && (
                      <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-muted/30">
                        <img
                          src={featured.cover_image_url}
                          alt={featured.cover_image_alt || featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      </div>
                    )}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      {featured.category && (
                        <p className="text-xs uppercase tracking-widest text-primary mb-3">
                          {featured.category}
                        </p>
                      )}
                      <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4 group-hover:text-primary transition">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                          {featured.excerpt}
                        </p>
                      )}
                      {featured.read_minutes && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock size={12} />
                          {featured.read_minutes} דק׳ קריאה
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                  <Card className="overflow-hidden h-full border-border/40 hover:border-primary/40 transition">
                    {p.cover_image_url && (
                      <div className="aspect-[16/10] overflow-hidden bg-muted/30">
                        <img
                          src={p.cover_image_url}
                          alt={p.cover_image_alt || p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      {p.category && (
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          {p.category}
                        </p>
                      )}
                      <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-primary transition">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Blog;