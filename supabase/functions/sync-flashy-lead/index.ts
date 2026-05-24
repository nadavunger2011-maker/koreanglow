import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(120).nullable().optional(),
  source_page: z.string().max(500).nullable().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const FLASHY_API_KEY = Deno.env.get('FLASHY_API_KEY');
    if (!FLASHY_API_KEY) {
      return new Response(JSON.stringify({ error: 'FLASHY_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { email, name, source_page } = parsed.data;

    // Flashy API — add contact to default list with WELCOME10 tag
    // Docs: https://flashyapp.com/api (POST /contacts/add)
    const res = await fetch('https://api.flashyapp.com/v1.0/contacts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': FLASHY_API_KEY,
      },
      body: JSON.stringify({
        email,
        first_name: name ?? undefined,
        tags: ['newsletter-popup', 'welcome10'],
        source: source_page ?? 'website-popup',
        subscribed: true,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Flashy API error', res.status, text);
      return new Response(JSON.stringify({ error: 'flashy_failed', status: res.status, body: text }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sync-flashy-lead error', err);
    return new Response(JSON.stringify({ error: 'unexpected' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});