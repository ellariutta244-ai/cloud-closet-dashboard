-- ============================================================
-- Contracts table patch — make user_id nullable for pre-signup
-- interns; add intern_email + intern_name for the onboarding flow.
-- ============================================================

ALTER TABLE public.contracts
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS intern_email text,
  ADD COLUMN IF NOT EXISTS intern_name  text;

-- Storage bucket for signed contract PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Only admins and the intern themselves (by user_id) can read PDFs
DROP POLICY IF EXISTS "Contract PDF owner read"    ON storage.objects;
DROP POLICY IF EXISTS "Service role upload contracts" ON storage.objects;

CREATE POLICY "Contract PDF owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Service role upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contracts');
