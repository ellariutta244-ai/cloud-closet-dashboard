CREATE TABLE IF NOT EXISTS public.saved_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  hook_text text NOT NULL,
  video_topic text,
  format_type text,
  goal text,
  audience text,
  saved_at timestamptz DEFAULT now()
);

ALTER TABLE public.saved_hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_hooks_all" ON public.saved_hooks FOR ALL USING (true) WITH CHECK (true);

-- Pushed hooks from admin to creator (stored in ugc_hooks table with a pushed_to field)
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS pushed_to uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS push_note text;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS video_topic text;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS format_type text;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS goal text;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS audience text;
ALTER TABLE public.ugc_hooks ADD COLUMN IF NOT EXISTS save_count integer DEFAULT 0;

-- Hook of the week stored in settings table (key = "hook_of_week", value = hook_id)
