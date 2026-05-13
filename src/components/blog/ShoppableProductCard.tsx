import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
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
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

export const ShoppableProductCard = ({ handle }: { handle: string }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProductByHandle(handle)
      .then((p) => active && setProduct(p))
      .catch(() => active && setProduct(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [handle]);

  const variant = product?.variants.edges[0]?.node;
  const image = product?.images.edges[0]?.node;

  const handleAdd = async () => {
    if (!product || !variant) return;
    await addItem({
      product: { node: product as never } as never,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("נוסף לעגלה", { position: "top-center" });
  };

  if (loading) {
    return (
      <Card className="my-8 p-6 flex items-center justify-center min-h-[180px]">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </Card>
    );
  }

  if (!product || !variant) {
    return (
      <Card className="my-8 p-6 text-center text-sm text-muted-foreground">
        מוצר לא זמין
      </Card>
    );
  }

  return (
    <Card className="my-8 overflow-hidden border-border/60 shadow-sm">
      <div className="grid sm:grid-cols-[180px,1fr] gap-0">
        {image && (
          <div className="bg-muted/30 aspect-square sm:aspect-auto">
            <img
              src={image.url}
              alt={image.altText || product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-5 flex flex-col justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              מוצר מומלץ
            </p>
            <h3 className="font-bold text-lg leading-tight">{product.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-black">
              {parseFloat(variant.price.amount).toFixed(2)} {variant.price.currencyCode}
            </span>
            <Button onClick={handleAdd} disabled={isLoading || !variant.availableForSale} size="sm">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 ml-2" />
                  הוספה לעגלה
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};