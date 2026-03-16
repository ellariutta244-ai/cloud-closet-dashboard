-- RLS policies for profiles table
-- Without these, client-side updates (deactivate, role changes) are silently blocked.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users view profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles"     ON public.profiles;

-- Anyone logged in can read all profiles (needed for name lookups throughout the app)
CREATE POLICY "Auth users view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own profile (e.g. tiktok_handle, last_seen_at)
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can insert, update, delete any profile
CREATE POLICY "Admins manage profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );
