ALTER TABLE public.ugc_submissions
  ADD COLUMN IF NOT EXISTS hook_text text,
  ADD COLUMN IF NOT EXISTS format_type text,
  ADD COLUMN IF NOT EXISTS video_length_seconds integer,
  ADD COLUMN IF NOT EXISTS niche text,
  ADD COLUMN IF NOT EXISTS trending_sound boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_cta boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_watch_time_seconds numeric,
  ADD COLUMN IF NOT EXISTS watch_completion_rate numeric,
  ADD COLUMN IF NOT EXISTS profile_visits integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traffic_fyp_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traffic_following_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traffic_search_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_sentiment text,
  ADD COLUMN IF NOT EXISTS followers_lost integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_follower_change integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_account_views integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS videos_posted integer DEFAULT 0;

-- Remove old day-split columns (optional — leave them for now to not break existing data)
