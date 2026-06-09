/**
 * GA4 Enhanced Ecommerce helpers.
 *
 * Events are pushed to the GTM dataLayer; configure a GA4 Event tag in GTM
 * with built-in ecommerce parameters enabled (or read `ecommerce` directly).
 * Purchase events are emitted by Shopify on the checkout domain — cross-domain
 * stitching is handled by `decorateUrlForCrossDomain`.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export interface EcItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_brand?: string;
  price: number;
  quantity?: number;
  currency?: string;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
}

const numericId = (gid: string): string => {
  if (!gid) return "";
  const parts = gid.split("/");
  return parts[parts.length - 1] || gid;
};

const push = (event: string, ecommerce: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object to avoid GA4 merging duplicates.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
  if (import.meta.env.DEV || (typeof window !== "undefined" && window.location.search.includes("ga_debug"))) {
    // eslint-disable-next-line no-console
    console.debug("[GA4]", event, ecommerce);
  }
};

interface ProductLike {
  node: {
    id: string;
    title: string;
    handle?: string;
    priceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
    variants?: { edges: Array<{ node: { id: string; title: string; price: { amount: string; currencyCode: string } } }> };
  };
}

export const productToItem = (
  product: ProductLike,
  opts: { index?: number; listId?: string; listName?: string; quantity?: number } = {},
): EcItem => {
  const node = product.node;
  const variant = node.variants?.edges?.[0]?.node;
  const price = parseFloat(variant?.price.amount || node.priceRange?.minVariantPrice.amount || "0");
  return {
    item_id: numericId(node.id),
    item_name: node.title,
    item_variant: variant?.title,
    price,
    currency: variant?.price.currencyCode || node.priceRange?.minVariantPrice.currencyCode,
    quantity: opts.quantity ?? 1,
    index: opts.index,
    item_list_id: opts.listId,
    item_list_name: opts.listName,
  };
};

const inferCurrency = (items: EcItem[]) => items.find((i) => i.currency)?.currency || "ILS";
const sumValue = (items: EcItem[]) =>
  items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);

export const trackViewItemList = (
  items: EcItem[],
  listId: string,
  listName: string,
) => {
  if (!items.length) return;
  push("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items.map((i, idx) => ({ ...i, index: idx, item_list_id: listId, item_list_name: listName })),
  });
};

export const trackSelectItem = (item: EcItem, listId?: string, listName?: string) => {
  push("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [{ ...item, item_list_id: listId, item_list_name: listName }],
  });
};

export const trackViewItem = (item: EcItem) => {
  push("view_item", { currency: item.currency || "ILS", value: item.price, items: [item] });
};

export const trackAddToCart = (item: EcItem) => {
  push("add_to_cart", {
    currency: item.currency || "ILS",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
};

export const trackRemoveFromCart = (item: EcItem) => {
  push("remove_from_cart", {
    currency: item.currency || "ILS",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
};

export const trackViewCart = (items: EcItem[]) => {
  push("view_cart", { currency: inferCurrency(items), value: sumValue(items), items });
};

export const trackBeginCheckout = (items: EcItem[]) => {
  push("begin_checkout", { currency: inferCurrency(items), value: sumValue(items), items });
};

export const toVariantNumericId = numericId;

/**
 * Generic dataLayer event push for non-ecommerce events (quiz, lead, UI).
 * Does NOT reset the ecommerce object.
 */
export const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (import.meta.env.DEV || (typeof window !== "undefined" && window.location.search.includes("ga_debug"))) {
    // eslint-disable-next-line no-console
    console.debug("[GA4]", event, params);
  }
};