-- Task comments: interns ask questions on tasks, admins reply
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view comments on tasks
CREATE POLICY "Auth users view task comments"
  ON public.task_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can insert comments
CREATE POLICY "Auth users insert task comments"
  ON public.task_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authors and admins can delete comments
CREATE POLICY "Author or admin delete task comments"
  ON public.task_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'wisconsin_admin')
    )
  );
