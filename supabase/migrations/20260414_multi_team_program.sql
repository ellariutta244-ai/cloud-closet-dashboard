-- ============================================================
-- Cloud Closet Ops — Multi-Team Internship Program
-- Run in Supabase SQL Editor (safe to re-run; uses IF NOT EXISTS
-- and DROP … IF EXISTS for idempotency).
-- ============================================================


-- ─── 1. university field on profiles ─────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university text;


-- ─── 2. Role enum for user_team_roles ────────────────────────
DO $$ BEGIN
  CREATE TYPE public.team_role AS ENUM
    ('intern','subteam_exec','team_exec','irm','admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─── 3. Widen the user_role enum ─────────────────────────────
-- profiles.role is a PostgreSQL enum (user_role), not a text column.
-- We add the three new values with IF NOT EXISTS (PG 12+).
-- NOTE: These ALTER TYPE statements must commit before any statement
-- in this same session references the new values in a profiles.role
-- context.  Run this file in a single paste — Supabase SQL editor
-- wraps each run in one transaction and PG 12+ allows enum additions
-- within a transaction (the new values are visible after commit).
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'subteam_exec';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'team_exec';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'irm';


-- ─── 4. teams ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  color      text NOT NULL DEFAULT '#E8D5C4',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users view teams"  ON public.teams;
DROP POLICY IF EXISTS "Admins manage teams"    ON public.teams;

CREATE POLICY "Auth users view teams" ON public.teams FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Seed teams (fixed UUIDs so migrations stay deterministic)
INSERT INTO public.teams (id, name, color) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Social',             '#DBEAFE'),
  ('10000000-0000-0000-0000-000000000002', 'Growth',             '#D1FAE5'),
  ('10000000-0000-0000-0000-000000000003', 'Creative Direction', '#FCE7F3'),
  ('10000000-0000-0000-0000-000000000004', 'Data/Strategy',      '#EDE9FE')
ON CONFLICT (id) DO NOTHING;


-- ─── 5. subteams ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subteams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (team_id, name)
);
ALTER TABLE public.subteams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users view subteams" ON public.subteams;
DROP POLICY IF EXISTS "Admins manage subteams"   ON public.subteams;

CREATE POLICY "Auth users view subteams" ON public.subteams FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage subteams" ON public.subteams FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Seed subteams (fixed UUIDs)
INSERT INTO public.subteams (id, team_id, name) VALUES
  -- Social
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'TikTok'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Instagram'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'UGC'),
  -- Growth
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Campus Partnerships'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'User Interviews'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Brand Partnerships'),
  -- Creative Direction
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Mockups Creator')
ON CONFLICT (id) DO NOTHING;


-- ─── 6. user_team_roles ──────────────────────────────────────
-- Supports one user belonging to multiple teams with different roles.
-- subteam_id is nullable: a team-level role has subteam_id = NULL.
-- Two partial unique indexes enforce:
--   • at most one team-level row per (user, team)
--   • at most one subteam-level row per (user, team, subteam)
CREATE TABLE IF NOT EXISTS public.user_team_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id     uuid NOT NULL REFERENCES public.teams(id)    ON DELETE CASCADE,
  subteam_id  uuid          REFERENCES public.subteams(id) ON DELETE SET NULL,
  role        public.team_role NOT NULL DEFAULT 'intern',
  created_at  timestamptz DEFAULT now()
);

-- Partial unique indexes (NULL-safe uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS utr_team_level
  ON public.user_team_roles (user_id, team_id)
  WHERE subteam_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS utr_subteam_level
  ON public.user_team_roles (user_id, team_id, subteam_id)
  WHERE subteam_id IS NOT NULL;

ALTER TABLE public.user_team_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users view user_team_roles"  ON public.user_team_roles;
DROP POLICY IF EXISTS "Admins manage user_team_roles"    ON public.user_team_roles;

CREATE POLICY "Auth users view user_team_roles" ON public.user_team_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage user_team_roles" ON public.user_team_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── 7. Extend tasks ─────────────────────────────────────────
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS team_id    uuid REFERENCES public.teams(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subteam_id uuid REFERENCES public.subteams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority   text DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','urgent')),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update task-insert RLS to allow team_exec / subteam_exec to create tasks.
-- New roles live in user_team_roles, so we check there rather than profiles.role
-- (avoids same-transaction enum visibility issues with the newly-added values).
DROP POLICY IF EXISTS "Admins insert tasks"  ON public.tasks;
DROP POLICY IF EXISTS "Execs insert tasks"   ON public.tasks;
CREATE POLICY "Execs insert tasks" ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin','cc_exec','wisconsin_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_id = auth.uid()
        AND role IN ('team_exec','subteam_exec')
    )
  );


-- ─── 8. Extend weekly_reports ────────────────────────────────
-- The existing table uses intern_id; we add content + submitted_at
-- for the new structured submission format.  intern_id == user_id.
ALTER TABLE public.weekly_reports
  ADD COLUMN IF NOT EXISTS content      jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Update SELECT policy so IRM / execs can also read reports.
-- Again, new roles checked via user_team_roles, not profiles.role.
DROP POLICY IF EXISTS "Interns view own reports"  ON public.weekly_reports;
CREATE POLICY "Interns view own reports" ON public.weekly_reports FOR SELECT
  USING (
    intern_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','wisconsin_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_id = auth.uid()
        AND role IN ('team_exec','subteam_exec','irm')
    )
  );


-- ─── 9. Extend announcements ─────────────────────────────────
-- Existing table already has: id, title, body, pinned, target_teams (jsonb), created_at.
-- Adding: target_type enum, team_id FK, subteam_id FK, tags, created_by.
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS target_type text DEFAULT 'global'
    CHECK (target_type IN ('global','team','subteam')),
  ADD COLUMN IF NOT EXISTS team_id     uuid REFERENCES public.teams(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subteam_id  uuid REFERENCES public.subteams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL;


-- ─── 10. contracts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          text NOT NULL DEFAULT '',
  signed_at        timestamptz,
  signature_data   text,
  pdf_url          text,
  token            uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  token_expires_at timestamptz,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Interns view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins manage contracts"    ON public.contracts;

CREATE POLICY "Interns view own contracts" ON public.contracts FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_id = auth.uid() AND role = 'irm'
    )
  );
CREATE POLICY "Admins manage contracts" ON public.contracts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));


-- ─── 11. intern_notes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intern_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note        text NOT NULL,
  flag_level  text NOT NULL DEFAULT 'none'
    CHECK (flag_level IN ('none','watch','concern','urgent')),
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.intern_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "IRM and admins view intern_notes"   ON public.intern_notes;
DROP POLICY IF EXISTS "IRM and admins manage intern_notes" ON public.intern_notes;

-- Only IRM and admin can see or write notes.
-- irm is a new role stored in user_team_roles, not profiles.role.
CREATE POLICY "IRM and admins view intern_notes" ON public.intern_notes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_team_roles WHERE user_id = auth.uid() AND role = 'irm')
  );
CREATE POLICY "IRM and admins manage intern_notes" ON public.intern_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_team_roles WHERE user_id = auth.uid() AND role = 'irm')
  );


-- ─── 12. Data migration: existing interns → Social team ──────
-- All active intern profiles land in Social at the team level.
-- Subteam assignments (TikTok / Instagram / UGC) should be set
-- manually in the dashboard or a follow-up migration once you
-- confirm each intern's placement.
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000001'::uuid, 'intern'
FROM   public.profiles
WHERE  role = 'intern'
  AND  (active IS NULL OR active = true)
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO NOTHING;


-- ─── 13. Named exec assignments ──────────────────────────────
-- These match on full_name using ILIKE — adjust if profiles use
-- different name formats. Uses ON CONFLICT … DO UPDATE so
-- re-running the migration is safe.

-- Ella → Social team_exec
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000001'::uuid, 'team_exec'
FROM   public.profiles WHERE full_name ILIKE '%Ella%'
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO UPDATE SET role = 'team_exec';

-- Ella → Data/Strategy team_exec
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000004'::uuid, 'team_exec'
FROM   public.profiles WHERE full_name ILIKE '%Ella%'
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO UPDATE SET role = 'team_exec';

-- Caroline → Creative Direction team_exec
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000003'::uuid, 'team_exec'
FROM   public.profiles WHERE full_name ILIKE '%Caroline%'
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO UPDATE SET role = 'team_exec';

-- Caroline → Data/Strategy team_exec (co-exec with Ella)
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000004'::uuid, 'team_exec'
FROM   public.profiles WHERE full_name ILIKE '%Caroline%'
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO UPDATE SET role = 'team_exec';

-- Micala → Growth team_exec
INSERT INTO public.user_team_roles (user_id, team_id, role)
SELECT id, '10000000-0000-0000-0000-000000000002'::uuid, 'team_exec'
FROM   public.profiles WHERE full_name ILIKE '%Micala%'
ON CONFLICT (user_id, team_id) WHERE subteam_id IS NULL
DO UPDATE SET role = 'team_exec';

-- Will → Social > TikTok subteam_exec
INSERT INTO public.user_team_roles (user_id, team_id, subteam_id, role)
SELECT id,
  '10000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  'subteam_exec'
FROM public.profiles WHERE full_name ILIKE '%Will%'
ON CONFLICT (user_id, team_id, subteam_id) WHERE subteam_id IS NOT NULL
DO UPDATE SET role = 'subteam_exec';

-- Noel → Social > Instagram subteam_exec
INSERT INTO public.user_team_roles (user_id, team_id, subteam_id, role)
SELECT id,
  '10000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000002'::uuid,
  'subteam_exec'
FROM public.profiles WHERE full_name ILIKE '%Noel%'
ON CONFLICT (user_id, team_id, subteam_id) WHERE subteam_id IS NOT NULL
DO UPDATE SET role = 'subteam_exec';

-- Jake → Social > UGC subteam_exec
INSERT INTO public.user_team_roles (user_id, team_id, subteam_id, role)
SELECT id,
  '10000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000003'::uuid,
  'subteam_exec'
FROM public.profiles WHERE full_name ILIKE '%Jake%'
ON CONFLICT (user_id, team_id, subteam_id) WHERE subteam_id IS NOT NULL
DO UPDATE SET role = 'subteam_exec';
