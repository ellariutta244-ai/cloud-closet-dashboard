ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS co_assignees uuid[] DEFAULT '{}';
