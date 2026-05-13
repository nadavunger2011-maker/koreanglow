
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  source_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX leads_email_idx ON public.leads (email);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous visitors) can insert a lead via the newsletter popup
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND char_length(email) <= 255);

-- No public SELECT policy: leads are private; only service_role/backend can read.
