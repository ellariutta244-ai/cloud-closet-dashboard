CREATE TABLE IF NOT EXISTS public.strategy_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'research_project',
  priority text DEFAULT 'medium',
  status text DEFAULT 'planning',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  contributors uuid[] DEFAULT '{}',
  project_url text,
  file_url text,
  notes jsonb DEFAULT '[]',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.strategy_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view strategy projects"
  ON public.strategy_projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users create strategy projects"
  ON public.strategy_projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner or admin update strategy projects"
  ON public.strategy_projects FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );

CREATE POLICY "Admins delete strategy projects"
  ON public.strategy_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );

-- Storage bucket for strategy project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('strategy-projects', 'strategy-projects', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users upload strategy files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'strategy-projects' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read strategy files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'strategy-projects');
