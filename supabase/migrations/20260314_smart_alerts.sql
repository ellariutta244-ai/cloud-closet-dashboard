CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  message text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('red', 'orange', 'yellow', 'purple')),
  dismissed boolean DEFAULT false,
  week_date text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "smart_alerts_all" ON public.smart_alerts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Default alert settings
INSERT INTO public.settings (key, value) VALUES (
  'alert_settings',
  '{"missed_submission":true,"no_post":true,"declining_performance":true,"missed_streak":true,"scale_rule":true,"viral":true,"same_format":true,"creator_inactive":true}'
) ON CONFLICT (key) DO NOTHING;
