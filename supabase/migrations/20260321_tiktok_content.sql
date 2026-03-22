-- tiktok_posts
CREATE TABLE IF NOT EXISTS public.tiktok_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  pillar text NOT NULL DEFAULT 'podcast_clips',
  status text NOT NULL DEFAULT 'idea',
  scheduled_date date,
  hook text DEFAULT '',
  caption text DEFAULT '',
  tiktok_url text DEFAULT '',
  assigned_to text DEFAULT 'Will',
  notes text DEFAULT '',
  order_num int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tiktok_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiktok_posts_all" ON public.tiktok_posts USING (auth.uid() IS NOT NULL);

-- tiktok_episodes
CREATE TABLE IF NOT EXISTS public.tiktok_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tiktok_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiktok_episodes_all" ON public.tiktok_episodes USING (auth.uid() IS NOT NULL);

-- tiktok_clips
CREATE TABLE IF NOT EXISTS public.tiktok_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES public.tiktok_episodes(id) ON DELETE CASCADE,
  clip_title text DEFAULT '',
  timestamp_start text DEFAULT '',
  timestamp_end text DEFAULT '',
  duration text DEFAULT '',
  status text DEFAULT 'identified',
  hook text DEFAULT '',
  caption text DEFAULT '',
  tags text DEFAULT '',
  tiktok_url text DEFAULT '',
  notes text DEFAULT '',
  order_num int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tiktok_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiktok_clips_all" ON public.tiktok_clips USING (auth.uid() IS NOT NULL);

-- tiktok_captions
CREATE TABLE IF NOT EXISTS public.tiktok_captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar text NOT NULL DEFAULT 'general',
  type text NOT NULL DEFAULT 'hook',
  content text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  used_count int DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tiktok_captions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiktok_captions_all" ON public.tiktok_captions USING (auth.uid() IS NOT NULL);

-- tiktok_analytics
CREATE TABLE IF NOT EXISTS public.tiktok_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  posts_published int DEFAULT 0,
  total_views int DEFAULT 0,
  total_likes int DEFAULT 0,
  total_comments int DEFAULT 0,
  total_shares int DEFAULT 0,
  followers_gained int DEFAULT 0,
  followers_total int DEFAULT 0,
  top_post_title text DEFAULT '',
  top_post_url text DEFAULT '',
  top_post_views int DEFAULT 0,
  best_pillar text,
  buffer_health int DEFAULT 0,
  will_notes text DEFAULT '',
  ella_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tiktok_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiktok_analytics_all" ON public.tiktok_analytics USING (auth.uid() IS NOT NULL);
