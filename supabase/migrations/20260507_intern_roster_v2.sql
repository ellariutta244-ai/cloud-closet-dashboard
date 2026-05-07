-- Add fields to intern_roster for email + contract content + linking to contracts table
alter table intern_roster
  add column if not exists email text,
  add column if not exists contract_content text,
  add column if not exists contract_token text,
  add column if not exists signing_url text;

-- Update contract_status to include awaiting_signature
alter table intern_roster
  drop constraint if exists intern_roster_contract_status_check;

alter table intern_roster
  add constraint intern_roster_contract_status_check
  check (contract_status in ('none', 'generated', 'awaiting_signature', 'complete'));
