import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SHOPIFY_DOMAIN = "v9zwr2-ge.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_TOKEN = "05932d5bc682bab92e446fe4584d75a3";
const SITE_URL = "https://www.korean-glow-il.shop";

// Strict title mapping for Google Merchant Center.
// Keys are the current product titles on the site; values are the feed-only titles.
const TITLE_MAP: Record<string, string> = {
  "ג'ל ניקוי שמחדש את העור": "טיפוח קוריאני | ג'ל ניקוי פנים מחדש - HL/Skin",
  "סרום ניאצינאמיד 10%": "טיפוח קוריאני | סרום ניאצינאמיד 10% לעור זכוכית - HL/Skin",
  "קרם למיצוק מרקם העור": "טיפוח קוריאני לעור בוגר | קרם למיצוק ומתיחת עור הפנים - HL/Skin",
  "קרם עיניים מזין": "טיפוח קוריאני | קרם עיניים מזין ועשיר בלחות - HL/Skin",
  "תחליב מזין לגוף ולידיים": "טיפוח קוריאני | תחליב גוף וידיים מזין ומחדש - HL/Skin",
  "חבילת בסיס – דקה ביום": "ערכת טיפוח קוריאני | חבילת בסיס למראה עור זוהר - HL/Skin",
  "חבילה מורחבת – זוהר ב-2 דקות ביום": "טיפוח קוריאני לעור בוגר | ערכת אנטי אייג'ינג מורחבת - HL/Skin",
  "החבילה המושלמת לפנים ולגוף – 3 דקות ביום": "ערכת טיפוח קוריאני מושלמת | חבילת פרימיום לפנים ולגוף - HL/Skin",
};

function normalize(s: string) {
  return (s || "")
    .replace(/\u200f|\u200e/g, "") // strip RTL/LTR marks
    .replace(/[\u2013\u2014]/g, "–") // unify dashes
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_MAP = new Map<string, string>(
  Object.entries(TITLE_MAP).map(([k, v]) => [normalize(k), v]),
);

function mapTitle(original: string): string {
  return NORMALIZED_MAP.get(normalize(original)) ?? original;
}

function xmlEscape(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const PRODUCTS_QUERY = `
  query Feed($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          description
          handle
          onlineStoreUrl
          productType
          vendor
          images(first: 1) { edges { node { url } } }
          variants(first: 1) {
            edges {
              node {
                id
                sku
                availableForSale
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
  }
`;

interface ProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  onlineStoreUrl: string | null;
  productType: string | null;
  vendor: string | null;
  images: { edges: Array<{ node: { url: string } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        sku: string | null;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      };
    }>;
  };
}

async function fetchAllProducts(): Promise<ProductNode[]> {
  const all: ProductNode[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const res = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { cursor } }),
      },
    );
    if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const data = json.data.products;
    for (const edge of data.edges) all.push(edge.node as ProductNode);
    if (!data.pageInfo.hasNextPage) break;
    cursor = data.pageInfo.endCursor;
  }
  return all;
}

function buildXml(products: ProductNode[], format: "xml" | "json") {
  const items = products
    .map((p) => {
      const variant = p.variants.edges[0]?.node;
      if (!variant) return null;
      const image = p.images.edges[0]?.node?.url ?? "";
      const link = p.onlineStoreUrl ?? `${SITE_URL}/products/${p.handle}`;
      const idNum = variant.id.match(/\d+/g)?.pop() ?? variant.id;
      const mappedTitle = mapTitle(p.title);
      return {
        id: idNum,
        title: mappedTitle,
        description: p.description || mappedTitle,
        link,
        image,
        availability: variant.availableForSale ? "in stock" : "out of stock",
        price: `${variant.price.amount} ${variant.price.currencyCode}`,
        brand: p.vendor || "HL/Skin",
        product_type: p.productType || "",
        mpn: variant.sku || idNum,
      };
    })
    .filter(Boolean) as Array<Record<string, string>>;

  if (format === "json") {
    return JSON.stringify({ items }, null, 2);
  }

  const xmlItems = items
    .map(
      (i) => `    <item>
      <g:id>${xmlEscape(i.id)}</g:id>
      <g:title>${xmlEscape(i.title)}</g:title>
      <g:description>${xmlEscape(i.description)}</g:description>
      <g:link>${xmlEscape(i.link)}</g:link>
      <g:image_link>${xmlEscape(i.image)}</g:image_link>
      <g:availability>${i.availability}</g:availability>
      <g:price>${xmlEscape(i.price)}</g:price>
      <g:brand>${xmlEscape(i.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>false</g:identifier_exists>
      <g:mpn>${xmlEscape(i.mpn)}</g:mpn>
      <g:product_type>${xmlEscape(i.product_type)}</g:product_type>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Korean Glow IL</title>
    <link>${SITE_URL}</link>
    <description>Google Merchant Center product feed</description>
${xmlItems}
  </channel>
</rss>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") === "json" ? "json" : "xml") as
      | "xml"
      | "json";
    const products = await fetchAllProducts();
    const body = buildXml(products, format);
    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type":
          format === "json" ? "application/json; charset=utf-8" : "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});