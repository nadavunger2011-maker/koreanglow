import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Loader2, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { CartDrawer } from "@/components/CartDrawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
}

const ProductDetailPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then((data) => {
        setProduct(data);
        setSelectedVariantId(data?.variants?.edges?.[0]?.node?.id ?? null);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [handle]);

  useEffect(() => {
    if (product) {
      document.title = `${product.title} | KOREANGLOW`;
    }
  }, [product]);

  // Show sticky add-to-cart bar after user scrolls past the hero area.
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [product]);

  const variant = product?.variants.edges.find((v) => v.node.id === selectedVariantId)?.node;

  // Split descriptionHtml into main content and FAQ (Q&A) entries.
  // FAQs are authored in Shopify as <details><summary>Q</summary><p>A</p></details>.
  const { mainHtml, faqs } = (() => {
    const html = product?.descriptionHtml || "";
    if (!html) return { mainHtml: "", faqs: [] as Array<{ q: string; a: string }> };

    if (typeof window === "undefined") return { mainHtml: html, faqs: [] };
    const container = document.createElement("div");
    container.innerHTML = html;

    const faqList: Array<{ q: string; a: string }> = [];
    container.querySelectorAll("details").forEach((d) => {
      const summary = d.querySelector("summary");
      const q = summary?.textContent?.trim() || "";
      summary?.remove();
      const a = d.innerHTML.trim();
      if (q && a) faqList.push({ q, a });
      d.remove();
    });

    // Remove the now-empty "שאלות נפוצות" heading if present.
    container.querySelectorAll("h2").forEach((h) => {
      if (h.textContent?.trim() === "שאלות נפוצות") h.remove();
    });

    return { mainHtml: container.innerHTML, faqs: faqList };
  })();

  // Inject FAQ JSON-LD schema for SEO.
  useEffect(() => {
    if (!faqs.length) return;
    const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    script.dataset.faqSchema = "true";
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [faqs]);

  const handleAddToCart = async () => {
    if (!product || !variant) return;
    await addItem({
      product: { node: product as never },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("נוסף לעגלה", { description: product.title, position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground" dir="rtl">
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-pink-600">
              KOREANGLOW
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm font-bold hover:text-pink-500 flex items-center gap-1">
                <ArrowRight size={16} />
                חזרה
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
          </div>
        ) : !product ? (
          <div className="text-center py-32">
            <h1 className="text-3xl font-bold mb-4">המוצר לא נמצא</h1>
            <Link to="/" className="text-pink-500 font-bold">
              חזרה לדף הבית
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden mb-4 shadow-xl">
                {product.images.edges[selectedImage] && (
                  <img
                    src={product.images.edges[selectedImage].node.url}
                    alt={product.images.edges[selectedImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {product.images.edges.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.images.edges.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        idx === selectedImage ? "border-pink-500" : "border-transparent"
                      }`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-5xl font-black text-pink-600">
                  ₪{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(0)}
                </span>
                <span className="text-lg text-slate-400">
                  {product.priceRange.minVariantPrice.currencyCode}
                </span>
              </div>

              {mainHtml ? (
                <div
                  className="product-rich-content mb-10"
                  dangerouslySetInnerHTML={{ __html: mainHtml }}
                />
              ) : (
                <div className="mb-10 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}

              {faqs.length > 0 && (
                <section className="mb-10" aria-labelledby="faq-heading">
                  <h2
                    id="faq-heading"
                    className="text-2xl md:text-3xl font-black text-slate-900 mb-4"
                  >
                    שאלות ותשובות
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-right font-bold text-base hover:no-underline">
                          {f.q}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div
                            className="text-slate-600 leading-relaxed text-base"
                            dangerouslySetInnerHTML={{ __html: f.a }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

              {product.options.length > 0 && product.options[0].name !== "Title" && (
                <div className="space-y-6 mb-10">
                  {product.options.map((option) => (
                    <div key={option.name}>
                      <h3 className="font-bold text-sm uppercase tracking-widest mb-3 text-slate-700">
                        {option.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.edges.map((v) => {
                          const optionValue = v.node.selectedOptions.find(
                            (o) => o.name === option.name,
                          )?.value;
                          if (!optionValue) return null;
                          const isSelected = v.node.id === selectedVariantId;
                          return (
                            <button
                              key={v.node.id}
                              onClick={() => setSelectedVariantId(v.node.id)}
                              className={`px-5 py-2.5 rounded-full font-bold text-sm border-2 transition-all ${
                                isSelected
                                  ? "border-pink-500 bg-pink-500 text-white"
                                  : "border-slate-200 hover:border-slate-400"
                              }`}
                            >
                              {optionValue}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isLoading || !variant?.availableForSale}
                className="w-full py-7 rounded-2xl font-bold text-lg bg-pink-500 hover:bg-pink-600 text-white shadow-xl shadow-pink-200 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : !variant?.availableForSale ? (
                  "אזל מהמלאי"
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    הוספה לסל
                  </>
                )}
              </Button>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Check size={16} className="text-pink-500" strokeWidth={3} />
                  משלוח מהיר
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Check size={16} className="text-pink-500" strokeWidth={3} />
                  אחריות מלאה
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {product && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
            showStickyBar ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <div className="hidden sm:block w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
              {product.images.edges[0] && (
                <img
                  src={product.images.edges[0].node.url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 truncate">{product.title}</p>
              <p className="text-pink-600 font-black text-lg leading-none">
                ₪{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(0)}
              </p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !variant?.availableForSale}
              className="rounded-2xl font-bold bg-pink-500 hover:bg-pink-600 text-white px-6 py-6 shadow-lg shadow-pink-200 active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !variant?.availableForSale ? (
                "אזל"
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 ml-2" />
                  הוספה לסל
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
