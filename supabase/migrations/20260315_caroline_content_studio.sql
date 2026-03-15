-- Caroline's Founder Content Studio
CREATE TABLE IF NOT EXISTS public.caroline_saved_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook text,
  concept_title text,
  full_concept jsonb,
  caption text,
  format text,
  series_name text,
  series_episodes jsonb,
  sound_notes text,
  mood text,
  audience text[],
  notes text,
  filmed boolean DEFAULT false,
  saved_at timestamptz DEFAULT now()
);
ALTER TABLE public.caroline_saved_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caroline_saved_ideas_all" ON public.caroline_saved_ideas FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.caroline_hook_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_text text NOT NULL,
  mood text,
  generated_at timestamptz DEFAULT now(),
  saved boolean DEFAULT false
);
ALTER TABLE public.caroline_hook_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caroline_hook_bank_all" ON public.caroline_hook_bank FOR ALL USING (true) WITH CHECK (true);
