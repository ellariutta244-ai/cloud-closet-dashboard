CREATE TABLE IF NOT EXISTS public.caroline_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid,
  idea_title text NOT NULL,
  remind_at timestamptz NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.caroline_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caroline_reminders_all" ON public.caroline_reminders FOR ALL USING (true) WITH CHECK (true);
