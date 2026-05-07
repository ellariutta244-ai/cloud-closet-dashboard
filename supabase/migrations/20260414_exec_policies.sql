-- ============================================================
-- Exec & IRM policy additions
-- Allows team_exec / subteam_exec to post announcements to
-- their team/subteam, and IRM to insert intern_notes.
-- ============================================================

-- Announcements: execs can insert (scoped by app logic)
DROP POLICY IF EXISTS "Execs post announcements"         ON public.announcements;
DROP POLICY IF EXISTS "Execs manage own announcements"   ON public.announcements;
DROP POLICY IF EXISTS "Admins insert announcements"      ON public.announcements;
DROP POLICY IF EXISTS "Admins manage announcements"      ON public.announcements;

CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Execs post announcements" ON public.announcements FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_team_roles WHERE user_id = auth.uid() AND role IN ('team_exec','subteam_exec'))
  );

CREATE POLICY "Execs manage own announcements" ON public.announcements FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- intern_notes: IRM users can insert and read (admin policy already covers admin)
DROP POLICY IF EXISTS "IRM insert intern_notes" ON public.intern_notes;
CREATE POLICY "IRM insert intern_notes" ON public.intern_notes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_team_roles WHERE user_id = auth.uid() AND role = 'irm')
  );

-- tasks: execs can also update tasks for their interns
DROP POLICY IF EXISTS "Owner or admin update tasks" ON public.tasks;
CREATE POLICY "Owner or admin update tasks" ON public.tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','wisconsin_admin'))
    OR EXISTS (SELECT 1 FROM public.user_team_roles WHERE user_id = auth.uid() AND role IN ('team_exec','subteam_exec'))
  );

DROP POLICY IF EXISTS "Admins delete tasks" ON public.tasks;
CREATE POLICY "Admins delete tasks" ON public.tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','wisconsin_admin')
  ));
