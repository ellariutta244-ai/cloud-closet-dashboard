-- Add avatar_url to profiles for headshot storage
alter table profiles
  add column if not exists avatar_url text;
