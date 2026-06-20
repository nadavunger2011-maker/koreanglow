import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Check, Gift } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { decorateUrlForCrossDomain } from "@/lib/gaLinker";
import {
  toVariantNumericId,
  trackBeginCheckout,
  trackRemoveFromCart,
  trackViewCart,
  type EcItem,
} from "@/lib/analytics";

export const CartDrawer = () => {
  const {
    items,
    isLoading,
    isSyncing,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
  } = useCartStore();
  const isOpen = isCartOpen;
  const setIsOpen = setCartOpen;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const totalOriginalValue = items.reduce((sum, item) => {
    const baseline = item.bundle?.originalValue ?? parseFloat(item.price.amount);
    return sum + baseline * item.quantity;
  }, 0);
  const totalSavings = Math.max(totalOriginalValue - totalPrice, 0);

  useEffect(() => {
    if (isOpen) {
      syncCart();
      trackViewCart(items.map(toEcItem));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function toEcItem(item: typeof items[number]): EcItem {
    return {
      item_id: toVariantNumericId(item.variantId),
      item_name: item.product.node.title,
      item_variant: item.variantTitle,
      price: parseFloat(item.price.amount),
      currency: item.price.currencyCode,
      quantity: item.quantity,
    };
  }

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      trackBeginCheckout(items.map(toEcItem));
      window.open(decorateUrlForCrossDomain(checkoutUrl), "_blank");
      setIsOpen(false);
    }
  };

  const handleRemove = (variantId: string) => {
    const item = items.find((i) => i.variantId === variantId);
    if (item) trackRemoveFromCart(toEcItem(item));
    removeItem(variantId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full" aria-label={`עגלת קניות${totalItems > 0 ? `, ${totalItems} פריטים` : ""}`}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-pink-500 hover:bg-pink-500">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full" side="left">
        <SheetHeader className="flex-shrink-0 text-right">
          <SheetTitle>עגלת קניות</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "העגלה ריקה" : `${totalItems} פריטים בעגלה`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">העגלה שלך ריקה</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="p-2 space-y-3 border border-pink-100 rounded-2xl bg-white/60">
                      <div className="flex gap-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.bundle ? (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Gift className="h-3.5 w-3.5 text-pink-500" />
                            <span className="text-[11px] font-black text-pink-600 uppercase tracking-wider">חבילה</span>
                          </div>
                        ) : null}
                        <h4 className="font-semibold text-sm leading-snug">{item.bundle?.name ?? item.product.node.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedOptions.map((option) => option.value).join(" • ")}
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold text-pink-600">
                            ₪{parseFloat(item.price.amount).toFixed(0)}
                          </span>
                          {item.bundle && item.bundle.originalValue > parseFloat(item.price.amount) && (
                            <span className="text-xs text-slate-400 line-through">
                              ₪{item.bundle.originalValue.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemove(item.variantId)}
                          aria-label={`הסרת ${item.product.node.title} מהעגלה`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label="הפחתת כמות"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            aria-label="הוספת כמות"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      </div>
                      {item.bundle && item.bundle.includes.length > 0 && (
                        <div className="rounded-xl bg-pink-50/60 border border-pink-100 px-3 py-2">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                            כלולים בחבילה:
                          </p>
                          <ul className="space-y-1">
                            {item.bundle.includes.map((inc, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <Check className="h-3 w-3 text-pink-500 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{inc.name}</span>
                                <span className="text-slate-400">₪{inc.price.toFixed(0)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                <div className="space-y-1.5">
                  {totalSavings > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>שווי כולל</span>
                        <span className="line-through">₪{totalOriginalValue.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                        <span>חסכת</span>
                        <span>₪{totalSavings.toFixed(0)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-semibold">המחיר שלך</span>
                    <span className="text-2xl font-black text-pink-600">
                      ₪{totalPrice.toFixed(0)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 ml-2" />
                      המשך לתשלום
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
