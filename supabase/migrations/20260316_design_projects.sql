CREATE TABLE IF NOT EXISTS public.design_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'branding',
  priority text DEFAULT 'medium',
  status text DEFAULT 'planning',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  contributors uuid[] DEFAULT '{}',
  project_url text,
  file_url text,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view design projects"
  ON public.design_projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users create design projects"
  ON public.design_projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner or admin update design projects"
  ON public.design_projects FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );

CREATE POLICY "Admins delete design projects"
  ON public.design_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );

-- Storage bucket for design project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-projects', 'design-projects', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users upload design files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'design-projects' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read design files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'design-projects');
