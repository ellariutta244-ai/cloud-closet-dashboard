-- Deduplicate fcm_tokens: keep only the most recent row per user_id
DELETE FROM public.fcm_tokens
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.fcm_tokens
  ORDER BY user_id, updated_at DESC NULLS LAST
);

-- Add unique constraint so upsert works correctly going forward
ALTER TABLE public.fcm_tokens
  DROP CONSTRAINT IF EXISTS fcm_tokens_user_id_key;

ALTER TABLE public.fcm_tokens
  ADD CONSTRAINT fcm_tokens_user_id_key UNIQUE (user_id);
