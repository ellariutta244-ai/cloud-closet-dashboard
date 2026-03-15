-- Wisconsin Weekly Reports for Caroline (director)
CREATE TABLE IF NOT EXISTS public.wisconsin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_date text NOT NULL UNIQUE,
  projects_snapshot jsonb DEFAULT '[]',
  requests_snapshot jsonb DEFAULT '[]',
  outreach_snapshot jsonb DEFAULT '[]',
  events_snapshot jsonb DEFAULT '{}',
  report_submissions_snapshot jsonb DEFAULT '{}',
  gemini_summary text,
  action_items jsonb DEFAULT '[]',
  caroline_notes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wisconsin_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wisconsin_reports_all" ON public.wisconsin_reports FOR ALL USING (true) WITH CHECK (true);
