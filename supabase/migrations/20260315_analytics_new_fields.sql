-- New analytics fields for ugc_submissions
ALTER TABLE public.ugc_submissions
  ADD COLUMN IF NOT EXISTS best_video_views      integer,
  ADD COLUMN IF NOT EXISTS worst_video_views     integer,
  ADD COLUMN IF NOT EXISTS most_active_time      text,
  ADD COLUMN IF NOT EXISTS traffic_profile_pct   numeric,
  ADD COLUMN IF NOT EXISTS traffic_sound_pct     numeric,
  ADD COLUMN IF NOT EXISTS top_search_query_1    text,
  ADD COLUMN IF NOT EXISTS top_search_query_2    text,
  ADD COLUMN IF NOT EXISTS top_search_query_3    text;
