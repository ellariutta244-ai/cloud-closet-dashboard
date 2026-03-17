-- External UGC Campaign management tables

CREATE TABLE IF NOT EXISTS external_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_campaign_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES external_campaigns(id) ON DELETE CASCADE,
  creator_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  tiktok text DEFAULT '',
  ig text DEFAULT '',
  fee integer DEFAULT 0,
  deliverables text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_deliverable_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES external_campaigns(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES external_campaign_creators(id) ON DELETE CASCADE,
  deliverable text NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'unpaid',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(creator_id, deliverable)
);

ALTER TABLE external_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE external_campaign_creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE external_deliverable_status DISABLE ROW LEVEL SECURITY;
