ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tiktok_handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ugc_status text DEFAULT 'active';

CREATE TABLE IF NOT EXISTS public.ugc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_date date NOT NULL,
  total_views integer DEFAULT 0,
  views_day1 integer DEFAULT 0,
  views_day2 integer DEFAULT 0,
  views_day3 integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  followers_gained integer DEFAULT 0,
  best_video_link text,
  benchmark_tier text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_pivot_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.ugc_submissions(id) ON DELETE CASCADE,
  week_date date NOT NULL,
  analytics_snapshot jsonb,
  ai_pivot text,
  admin_notes text,
  example_video_link text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_pivots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  queue_id uuid REFERENCES public.ugc_pivot_queue(id) ON DELETE SET NULL,
  week_date date NOT NULL,
  ai_pivot text,
  admin_notes text,
  example_video_link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_text text NOT NULL,
  view_count integer DEFAULT 0,
  week_date date,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_date date NOT NULL,
  hooks text,
  format_recs text,
  brand_guidelines text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ugc_qa_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.ugc_qa(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.google_sheet_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_pivot_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_pivots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_qa_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheet_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ugc_submissions_all" ON public.ugc_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_pivot_queue_all" ON public.ugc_pivot_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_pivots_all" ON public.ugc_pivots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_hooks_all" ON public.ugc_hooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_briefs_all" ON public.ugc_briefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_announcements_all" ON public.ugc_announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_qa_all" ON public.ugc_qa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ugc_qa_replies_all" ON public.ugc_qa_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "google_sheet_config_all" ON public.google_sheet_config FOR ALL USING (true) WITH CHECK (true);
