-- ============================================================
-- Sorority Rush Plan Migration
-- 2026-03-17
-- ============================================================

-- Danica auth user + profile
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated', 'authenticated', 'danica.sorge13@gmail.com',
  crypt('CloudCloset!', gen_salt('bf')), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Danica"}',
  NOW(), NOW(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, team)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'danica.sorge13@gmail.com', 'Danica', 'admin', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rush_overview (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  north_star_goal text,
  opportunities   jsonb DEFAULT '[]',
  extra_sections  jsonb DEFAULT '[]',
  updated_at      timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_timeline_phases (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text,
  due_label  text,
  order_num  int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_timeline_rows (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id   uuid REFERENCES public.rush_timeline_phases(id) ON DELETE CASCADE,
  week       text,
  dates      text,
  action     text,
  owner      text,
  status     text DEFAULT 'not_started',
  order_num  int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_influencers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school        text,
  name          text,
  tiktok        text,
  instagram     text,
  followers     text,
  avg_views     text,
  audience_demo text,
  deliverables  text,
  fee           text,
  status        text DEFAULT 'not_contacted',
  notes         text,
  order_num     int DEFAULT 0,
  created_at    timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_tote_items (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item      text,
  purpose   text,
  cost_low  numeric,
  cost_high numeric,
  quantity  int,
  vendor    text,
  status    text DEFAULT 'explore',
  order_num int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_tote_settings (
  id               uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000002',
  num_chapters     int DEFAULT 0,
  bags_per_chapter int DEFAULT 0,
  updated_at       timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_strategy_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  content      jsonb DEFAULT '[]',
  updated_at   timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_action_items (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action    text,
  owner     text,
  due_date  text,
  priority  text DEFAULT 'medium',
  status    text DEFAULT 'not_started',
  order_num int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rush_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_tab     text,
  author_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text,
  content     text,
  parent_id   uuid REFERENCES public.rush_notes(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT NOW(),
  updated_at  timestamptz DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================

-- rush_overview
ALTER TABLE public.rush_overview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_overview_select" ON public.rush_overview
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_overview_insert" ON public.rush_overview
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_overview_update" ON public.rush_overview
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_overview_delete" ON public.rush_overview
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_timeline_phases
ALTER TABLE public.rush_timeline_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_timeline_phases_select" ON public.rush_timeline_phases
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_timeline_phases_insert" ON public.rush_timeline_phases
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_timeline_phases_update" ON public.rush_timeline_phases
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_timeline_phases_delete" ON public.rush_timeline_phases
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_timeline_rows
ALTER TABLE public.rush_timeline_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_timeline_rows_select" ON public.rush_timeline_rows
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_timeline_rows_insert" ON public.rush_timeline_rows
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_timeline_rows_update" ON public.rush_timeline_rows
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_timeline_rows_delete" ON public.rush_timeline_rows
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_influencers
ALTER TABLE public.rush_influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_influencers_select" ON public.rush_influencers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_influencers_insert" ON public.rush_influencers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_influencers_update" ON public.rush_influencers
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_influencers_delete" ON public.rush_influencers
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_tote_items
ALTER TABLE public.rush_tote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_tote_items_select" ON public.rush_tote_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_tote_items_insert" ON public.rush_tote_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_tote_items_update" ON public.rush_tote_items
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_tote_items_delete" ON public.rush_tote_items
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_tote_settings
ALTER TABLE public.rush_tote_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_tote_settings_select" ON public.rush_tote_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_tote_settings_insert" ON public.rush_tote_settings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_tote_settings_update" ON public.rush_tote_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_tote_settings_delete" ON public.rush_tote_settings
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_strategy_sections
ALTER TABLE public.rush_strategy_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_strategy_sections_select" ON public.rush_strategy_sections
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_strategy_sections_insert" ON public.rush_strategy_sections
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_strategy_sections_update" ON public.rush_strategy_sections
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_strategy_sections_delete" ON public.rush_strategy_sections
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_action_items
ALTER TABLE public.rush_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_action_items_select" ON public.rush_action_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_action_items_insert" ON public.rush_action_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_action_items_update" ON public.rush_action_items
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "rush_action_items_delete" ON public.rush_action_items
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- rush_notes
ALTER TABLE public.rush_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rush_notes_select" ON public.rush_notes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_notes_insert" ON public.rush_notes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','director'))
  );
CREATE POLICY "rush_notes_update" ON public.rush_notes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    (
      author_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
CREATE POLICY "rush_notes_delete" ON public.rush_notes
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    (
      author_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
