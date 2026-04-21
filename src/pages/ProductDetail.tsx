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

  const variant = product?.variants.edges.find((v) => v.node.id === selectedVariantId)?.node;

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

              <div className="prose prose-slate max-w-none mb-10 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>

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
    </div>
  );
};

export default ProductDetailPage;
