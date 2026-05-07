-- Intern master roster (pre-account / CRM-style tracking)
create table if not exists intern_roster (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  school text,
  start_month text,
  end_month text,
  team_id uuid references teams(id) on delete set null,
  subteam_ids uuid[] default '{}',
  contract_status text not null default 'none'
    check (contract_status in ('none', 'generated', 'sent', 'complete')),
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table intern_roster enable row level security;
create policy "intern_roster_all" on intern_roster for all using (auth.uid() is not null);
