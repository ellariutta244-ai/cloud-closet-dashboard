-- Add leader_id to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS leader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update RLS: allow any authenticated user to update events (not just owner/admin)
DROP POLICY IF EXISTS "Owner or admin update events" ON public.events;

CREATE POLICY "Auth users update events"
  ON public.events FOR UPDATE
  USING (auth.uid() IS NOT NULL);
