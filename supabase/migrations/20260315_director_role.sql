-- Add director role support
-- If profiles.role is a text column with check constraint:
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'intern', 'ugc_creator', 'director'));
EXCEPTION WHEN others THEN NULL; END $$;

-- Brief comments table for director feedback on briefs
CREATE TABLE IF NOT EXISTS public.brief_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES public.ugc_briefs(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.brief_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brief_comments_all" ON public.brief_comments FOR ALL USING (true) WITH CHECK (true);
