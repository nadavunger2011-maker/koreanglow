import { Link } from "react-router-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import {
  productToItem,
  toVariantNumericId,
  trackAddToCart,
  trackSelectItem,
} from "@/lib/analytics";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const node = product.node;
  const variant = node.variants.edges[0]?.node;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    trackAddToCart({
      item_id: toVariantNumericId(node.id),
      item_name: node.title,
      item_variant: variant.title,
      price: parseFloat(variant.price.amount),
      currency: variant.price.currencyCode,
      quantity: 1,
    });
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("נוסף לעגלה", {
      description: node.title,
      position: "top-center",
    });
  };

  return (
    <Link
      to={`/product/${node.handle}`}
      onClick={() => trackSelectItem(productToItem(product), "products_grid", "Products Grid")}
      className="group bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl flex flex-col min-w-0 w-full"
    >
      <div className="mb-6 aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-300">אין תמונה</div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2 text-slate-900 line-clamp-2">{node.title}</h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{node.description}</p>

      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-black text-pink-600">
          ₪{parseFloat(price.amount).toFixed(0)}
        </span>
        <span className="text-sm text-slate-400">{price.currencyCode}</span>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isLoading || !variant?.availableForSale}
        className="w-full py-6 rounded-2xl font-bold text-base bg-slate-900 hover:bg-pink-500 text-white transition-all"
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
    </Link>
  );
};
