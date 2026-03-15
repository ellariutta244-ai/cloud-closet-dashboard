-- Add recreation fields to caroline_saved_ideas
ALTER TABLE public.caroline_saved_ideas
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS recreation_guide jsonb,
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'original';
