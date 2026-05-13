import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getReadingHistory, scoreRecommendations } from "@/lib/readingHistory";

type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
};

export const RecommendedSidebar = ({ currentSlug }: { currentSlug: string }) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, category, tags")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data) return;
        const filtered = data.filter((p) => p.slug !== currentSlug);
        const ranked = scoreRecommendations(filtered, getReadingHistory());
        setItems(ranked.slice(0, 4));
      });
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-widest">מומלץ עבורך</h2>
      </div>
      <div className="space-y-4">
        {items.map((p) => (
          <Link key={p.id} to={`/blog/${p.slug}`} className="block group">
            <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition">
              {p.cover_image_url && (
                <div className="aspect-[16/10] overflow-hidden bg-muted/30">
                  <img
                    src={p.cover_image_url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-4">
                {p.category && (
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {p.category}
                  </p>
                )}
                <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition">
                  {p.title}
                </h3>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </aside>
  );
};