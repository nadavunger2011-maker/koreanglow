import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_EMAIL = "nadavunger2011@gmail.com";
const SHOPIFY_DOMAIN = "v9zwr2-ge.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type OrderLineItem = { title: string; quantity: number; price: string };
type ShopifyOrder = {
  id: number;
  created_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  line_items: OrderLineItem[];
};

async function fetchRecentOrders(token: string): Promise<ShopifyOrder[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=100&created_at_min=${encodeURIComponent(
    since,
  )}`;
  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify orders error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.orders || [];
}

function aggregateOrders(orders: ShopifyOrder[]) {
  const productMap = new Map<string, { units: number; revenue: number }>();
  let totalRevenue = 0;
  for (const o of orders) {
    totalRevenue += parseFloat(o.total_price || "0");
    for (const li of o.line_items || []) {
      const cur = productMap.get(li.title) || { units: 0, revenue: 0 };
      cur.units += li.quantity;
      cur.revenue += parseFloat(li.price || "0") * li.quantity;
      productMap.set(li.title, cur);
    }
  }
  const topProducts = Array.from(productMap.entries())
    .map(([title, v]) => ({ title, units: v.units, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  return {
    orderCount: orders.length,
    totalRevenue: Math.round(totalRevenue),
    topProducts,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
  if (userErr || !userData.user || userData.user.email?.toLowerCase() !== ALLOWED_EMAIL) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SHOPIFY_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!SHOPIFY_TOKEN) throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [orders, leadsAll, leads30, leads7] = await Promise.all([
      fetchRecentOrders(SHOPIFY_TOKEN),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since30),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since7),
    ]);

    const sales = aggregateOrders(orders);
    const leadStats = {
      total: leadsAll.count ?? 0,
      last30: leads30.count ?? 0,
      last7: leads7.count ?? 0,
    };

    const conversionRate30 =
      leadStats.last30 > 0 ? ((sales.orderCount / leadStats.last30) * 100).toFixed(1) : "n/a";

    const dataSummary = {
      window_days: 30,
      sales_30d: {
        orders: sales.orderCount,
        revenue_ils: sales.totalRevenue,
        top_products: sales.topProducts,
      },
      leads: leadStats,
      lead_to_order_conversion_pct: conversionRate30,
    };

    const systemPrompt =
      "You are a senior e-commerce marketing strategist for a Korean skincare DTC brand (Koreanglow, Israeli market, Hebrew-speaking customers). Analyze the data and produce 3 concrete, prioritized, data-driven marketing tips. Use a professional, analytical tone. Reference specific numbers from the data. Each tip must be actionable within 7 days. Respond in Hebrew.";

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Sales & lead data (last 30 days):\n${JSON.stringify(dataSummary, null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "marketing_tips",
              description: "Return exactly 3 prioritized marketing tips.",
              parameters: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Short one-line summary of what the data shows.",
                  },
                  tips: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        rationale: {
                          type: "string",
                          description: "Why, with reference to specific numbers.",
                        },
                        action: {
                          type: "string",
                          description: "Concrete step to take this week.",
                        },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["title", "rationale", "action", "priority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["headline", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "marketing_tips" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiRes.text();
      throw new Error(`AI gateway error ${aiRes.status}: ${t.slice(0, 200)}`);
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    let analysis: { headline: string; tips: unknown[] } = { headline: "", tips: [] };
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch {
        analysis = { headline: "", tips: [] };
      }
    }

    return new Response(
      JSON.stringify({ data: dataSummary, analysis, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});