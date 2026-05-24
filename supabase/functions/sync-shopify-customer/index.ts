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
    const SHOP_DOMAIN = Deno.env.get('SHOPIFY_SHOP_DOMAIN'); // e.g. xxx.myshopify.com
    const ADMIN_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!SHOP_DOMAIN || !ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: 'shopify_admin_not_configured' }), {
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
    const first_name = name?.split(' ')[0] ?? undefined;
    const last_name = name?.split(' ').slice(1).join(' ') || undefined;

    // Create Shopify customer with marketing consent → Flashy picks it up via its Shopify sync
    const res = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2025-07/customers.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            email,
            first_name,
            last_name,
            tags: `newsletter-popup,welcome10,${source_page ?? 'site'}`.slice(0, 250),
            email_marketing_consent: {
              state: 'subscribed',
              opt_in_level: 'single_opt_in',
              consent_updated_at: new Date().toISOString(),
            },
          },
        }),
      }
    );

    const text = await res.text();
    // 422 with "email already taken" is a benign no-op
    if (!res.ok && res.status !== 422) {
      console.error('Shopify customer create failed', res.status, text);
      return new Response(JSON.stringify({ error: 'shopify_failed', status: res.status, body: text }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, already_exists: res.status === 422 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sync-shopify-customer error', err);
    return new Response(JSON.stringify({ error: 'unexpected' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});