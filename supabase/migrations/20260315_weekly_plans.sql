-- Weekly content plans for UGC creators
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_date text NOT NULL,
  week_goal text,
  phase text,
  monday jsonb,
  tuesday jsonb,
  wednesday jsonb,
  thursday jsonb,
  friday jsonb,
  saturday jsonb,
  sunday jsonb,
  ab_test text,
  weekly_reminder text,
  status text DEFAULT 'draft',  -- draft | approved | sent
  raw_ai_output text,
  completed_days jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_plans_all" ON public.weekly_plans FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS weekly_plans_creator_week ON public.weekly_plans (creator_id, week_date);
