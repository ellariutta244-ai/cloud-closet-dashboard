CREATE TABLE IF NOT EXISTS public.ugc_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  file_url text,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ugc_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ugc_resources_all" ON public.ugc_resources FOR ALL USING (true) WITH CHECK (true);
