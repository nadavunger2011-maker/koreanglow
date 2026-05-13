import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_EMAIL = "nadavunger2011@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (req.method === "GET") {
      const [leadsRes, notesRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("lead_notes").select("*").order("created_at", { ascending: false }),
      ]);
      if (leadsRes.error) throw leadsRes.error;
      if (notesRes.error) throw notesRes.error;
      return new Response(
        JSON.stringify({ leads: leadsRes.data, notes: notesRes.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (req.method === "POST") {
      const { lead_id, note } = await req.json();
      if (!lead_id || !note) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("lead_notes")
        .insert({ lead_id, note })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ note: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const { id } = await req.json();
      const { error } = await supabase.from("lead_notes").delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});