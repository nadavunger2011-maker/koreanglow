import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_EMAIL = "nadavunger2011@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHOP_DOMAIN = "v9zwr2-ge.myshopify.com";
const API_VERSION = "2025-07";
const ADMIN_URL = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

const QUERY = `
  query Orders($cursor: String, $query: String) {
    orders(first: 100, after: $cursor, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          createdAt
          displayFinancialStatus
          customer { id }
          totalPriceSet { shopMoney { amount currencyCode } }
          lineItems(first: 50) {
            edges {
              node {
                quantity
                originalTotalSet { shopMoney { amount } }
                product { id title }
                variant { id }
              }
            }
          }
        }
      }
    }
  }
`;

type Order = {
  id: string;
  createdAt: string;
  displayFinancialStatus: string;
  customer: { id: string } | null;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: {
    edges: Array<{
      node: {
        quantity: number;
        originalTotalSet: { shopMoney: { amount: string } };
        product: { id: string; title: string } | null;
        variant: { id: string } | null;
      };
    }>;
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: u } = await auth.auth.getUser(jwt);
    if (u.user?.email?.toLowerCase() !== ALLOWED_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "SHOPIFY_ACCESS_TOKEN missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { since, until, productId } = await req.json().catch(() => ({}));
    const start = since ? new Date(since) : new Date(Date.now() - 30 * 86400000);
    const end = until ? new Date(until) : new Date();
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);

    const q = `created_at:>='${prevStart.toISOString()}' created_at:<='${end.toISOString()}'`;

    // Paginate
    const orders: Order[] = [];
    let cursor: string | null = null;
    for (let i = 0; i < 10; i++) {
      const r = await fetch(ADMIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({ query: QUERY, variables: { cursor, query: q } }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Shopify ${r.status}: ${t.slice(0, 200)}`);
      }
      const j = await r.json();
      if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300));
      const data = j.data.orders;
      orders.push(...data.edges.map((e: { node: Order }) => e.node));
      if (!data.pageInfo.hasNextPage) break;
      cursor = data.pageInfo.endCursor;
    }

    // Filter by product if needed
    const filterOrder = (o: Order) => {
      if (!productId) return true;
      return o.lineItems.edges.some((e) => e.node.product?.id === productId);
    };

    const inRange = (o: Order, s: Date, e: Date) => {
      const t = new Date(o.createdAt).getTime();
      return t >= s.getTime() && t <= e.getTime() && filterOrder(o);
    };

    const calc = (s: Date, e: Date) => {
      const subset = orders.filter((o) => inRange(o, s, e));
      let revenue = 0;
      const customerIds = new Set<string>();
      for (const o of subset) {
        // sum only matching line items if productId
        if (productId) {
          for (const li of o.lineItems.edges) {
            if (li.node.product?.id === productId) {
              revenue += parseFloat(li.node.originalTotalSet.shopMoney.amount);
            }
          }
        } else {
          revenue += parseFloat(o.totalPriceSet.shopMoney.amount);
        }
        if (o.customer?.id) customerIds.add(o.customer.id);
      }
      const ordersCount = subset.length;
      return {
        revenue,
        orders: ordersCount,
        customers: customerIds.size,
        aov: ordersCount ? revenue / ordersCount : 0,
      };
    };

    const current = calc(start, end);
    const previous = calc(prevStart, start);
    const currency =
      orders[0]?.totalPriceSet.shopMoney.currencyCode || "ILS";

    // Daily series
    const dayMs = 86400000;
    const days = Math.max(1, Math.ceil(periodMs / dayMs));
    const series: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 0; i < days; i++) {
      const ds = new Date(start.getTime() + i * dayMs);
      const de = new Date(start.getTime() + (i + 1) * dayMs);
      const subset = orders.filter((o) => inRange(o, ds, de));
      let rev = 0;
      for (const o of subset) {
        if (productId) {
          for (const li of o.lineItems.edges) {
            if (li.node.product?.id === productId) {
              rev += parseFloat(li.node.originalTotalSet.shopMoney.amount);
            }
          }
        } else {
          rev += parseFloat(o.totalPriceSet.shopMoney.amount);
        }
      }
      series.push({
        date: ds.toISOString().slice(0, 10),
        revenue: Math.round(rev * 100) / 100,
        orders: subset.length,
      });
    }

    // Top products (always computed across all orders in current range, ignoring product filter)
    const productMap = new Map<
      string,
      { id: string; title: string; units: number; revenue: number; orders: number }
    >();
    for (const o of orders.filter((o) => inRange(o, start, end))) {
      const seenInOrder = new Set<string>();
      for (const li of o.lineItems.edges) {
        const p = li.node.product;
        if (!p) continue;
        const cur = productMap.get(p.id) || {
          id: p.id,
          title: p.title,
          units: 0,
          revenue: 0,
          orders: 0,
        };
        cur.units += li.node.quantity;
        cur.revenue += parseFloat(li.node.originalTotalSet.shopMoney.amount);
        if (!seenInOrder.has(p.id)) {
          cur.orders += 1;
          seenInOrder.add(p.id);
        }
        productMap.set(p.id, cur);
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 50);

    // Hour heatmap (0..23) x (0..6)
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const o of orders.filter((o) => inRange(o, start, end))) {
      const d = new Date(o.createdAt);
      heatmap[d.getDay()][d.getHours()] += 1;
    }

    return new Response(
      JSON.stringify({
        currency,
        current,
        previous,
        series,
        topProducts,
        heatmap,
        meta: {
          start: start.toISOString(),
          end: end.toISOString(),
          ordersScanned: orders.length,
          productId: productId || null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});