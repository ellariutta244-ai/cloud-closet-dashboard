-- Add tiktok_url column to profiles for storing full TikTok profile URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tiktok_url text;
