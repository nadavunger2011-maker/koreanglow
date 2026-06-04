import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_EMAIL = "nadavunger2011@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

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

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!lovableKey || !gscKey) {
      return new Response(
        JSON.stringify({ error: "Search Console connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const { siteUrl, since, until, action } = body as {
      siteUrl?: string;
      since?: string;
      until?: string;
      action?: string;
    };

    const baseHeaders = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
    };

    // List verified sites (used by the SEO picker in the dashboard).
    if (action === "list-sites") {
      const sr = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers: baseHeaders });
      const sj = sr.ok ? await sr.json() : { siteEntry: [] };
      const entries = (sj.siteEntry || []).filter(
        (e: { permissionLevel: string }) => e.permissionLevel !== "siteUnverifiedUser",
      );
      return new Response(JSON.stringify({ sites: entries }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startDate = (since ? new Date(since) : new Date(Date.now() - 30 * 86400000))
      .toISOString()
      .slice(0, 10);
    const endDate = (until ? new Date(until) : new Date()).toISOString().slice(0, 10);

    // Site selection: explicit > project default > first verified.
    const DEFAULT_SITE = "https://korean-glow-il.shop/";
    let site = siteUrl as string | undefined;
    if (!site) {
      const sr = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers: baseHeaders });
      if (sr.ok) {
        const sj = await sr.json();
        const entries = (sj.siteEntry || []) as Array<{ siteUrl: string; permissionLevel: string }>;
        const verified = entries.filter((e) => e.permissionLevel !== "siteUnverifiedUser");
        const preferred = verified.find((e) => e.siteUrl === DEFAULT_SITE);
        site = preferred?.siteUrl || verified[0]?.siteUrl;
      }
    }
    if (!site) {
      return new Response(
        JSON.stringify({ error: "No verified Search Console site found", queries: [], pages: [], totals: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const encSite = encodeURIComponent(site);
    const sqUrl = `${GATEWAY}/webmasters/v3/sites/${encSite}/searchAnalytics/query`;
    const headers = {
      ...baseHeaders,
      "Content-Type": "application/json",
    };

    const fetchDim = async (dim: string) => {
      const r = await fetch(sqUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [dim],
          rowLimit: 25,
        }),
      });
      if (!r.ok) return [];
      const j = await r.json();
      return j.rows || [];
    };

    const [queries, pages, totalsR] = await Promise.all([
      fetchDim("query"),
      fetchDim("page"),
      fetch(sqUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ startDate, endDate, dimensions: [] }),
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const totals = totalsR?.rows?.[0] || null;

    return new Response(
      JSON.stringify({ site, queries, pages, totals, range: { startDate, endDate } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});