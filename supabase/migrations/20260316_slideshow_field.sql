-- Add is_slideshow flag to ugc_submissions
ALTER TABLE public.ugc_submissions
  ADD COLUMN IF NOT EXISTS is_slideshow boolean DEFAULT false;
