
CREATE POLICY "Deny select on leads to clients" ON public.leads FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny update on leads to clients" ON public.leads FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny delete on leads to clients" ON public.leads FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "Deny select on lead_notes to clients" ON public.lead_notes FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny insert on lead_notes to clients" ON public.lead_notes FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny update on lead_notes to clients" ON public.lead_notes FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny delete on lead_notes to clients" ON public.lead_notes FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "Deny select on blog_post_views to clients" ON public.blog_post_views FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny update on blog_post_views to clients" ON public.blog_post_views FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny delete on blog_post_views to clients" ON public.blog_post_views FOR DELETE TO anon, authenticated USING (false);
