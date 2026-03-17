-- Soraa UGC Campaign Tables
-- RLS is DISABLED — Soraa uses custom auth via API routes with service role

-- 1. soraa_submissions
CREATE TABLE IF NOT EXISTS soraa_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email text NOT NULL,
  creator_name text NOT NULL,
  deliverable text NOT NULL,
  platform text,
  handle text,
  post_link text,
  date_posted text,
  time_posted text,
  hook text,
  video_type text,
  caption text,
  cta_text text,
  cta_placement text,
  cloud_closet_visible boolean DEFAULT false,
  views int DEFAULT 0,
  likes int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares int DEFAULT 0,
  saves int DEFAULT 0,
  intent_comments_count int DEFAULT 0,
  what_app_comments int DEFAULT 0,
  profile_clicks int DEFAULT 0,
  top_comments text,
  common_confusion text,
  common_excitement text,
  repeated_phrases text,
  creator_reflection_interest text,
  creator_reflection_change text,
  ai_analysis text,
  analyzed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE soraa_submissions DISABLE ROW LEVEL SECURITY;

-- 2. soraa_questions
CREATE TABLE IF NOT EXISTS soraa_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email text NOT NULL,
  creator_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE soraa_questions DISABLE ROW LEVEL SECURITY;

-- 3. soraa_question_replies
CREATE TABLE IF NOT EXISTS soraa_question_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES soraa_questions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE soraa_question_replies DISABLE ROW LEVEL SECURITY;

-- 4. soraa_deliverable_status
CREATE TABLE IF NOT EXISTS soraa_deliverable_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_email text NOT NULL,
  deliverable text NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'unpaid',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(creator_email, deliverable)
);

ALTER TABLE soraa_deliverable_status DISABLE ROW LEVEL SECURITY;

-- Seed soraa_deliverable_status with all 6 creators × their deliverables
INSERT INTO soraa_deliverable_status (creator_email, deliverable) VALUES
  -- Ankisha Bhargava
  ('ankishabhargava1989@gmail.com', '1x TikTok'),
  ('ankishabhargava1989@gmail.com', 'Connect with founder'),
  -- Melissa Rodriguez
  ('melissarod31@yahoo.com', '1x TikTok'),
  ('melissarod31@yahoo.com', 'Connect with founder'),
  -- Gabrielle Boyer-Baker
  ('gabrielleboyerbaker@gmail.com', '1x TikTok'),
  ('gabrielleboyerbaker@gmail.com', '1x IG Story'),
  ('gabrielleboyerbaker@gmail.com', 'Connect with founder'),
  -- Hailey Malinczak
  ('haileymarieinfluences@gmail.com', '1x TikTok'),
  -- Neha Urbaetis
  ('nehadias.fit@gmail.com', '1x IG Reel/TikTok'),
  ('nehadias.fit@gmail.com', '1x IG Story'),
  -- Natalia Alexis
  ('nataliahouse0@gmail.com', '1x TikTok')
ON CONFLICT (creator_email, deliverable) DO NOTHING;
