-- Sprints system
create table if not exists sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists sprint_assignments (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references sprints(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id) on delete set null,
  sprint_focus text,
  tracking_notes text,
  created_at timestamptz default now(),
  unique(sprint_id, assigned_to)
);

create table if not exists sprint_deliverables (
  id uuid primary key default gen_random_uuid(),
  sprint_assignment_id uuid references sprint_assignments(id) on delete cascade,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'complete')),
  is_checkin_item boolean not null default false,
  rolled_over_from uuid references sprint_deliverables(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists sprint_checkins (
  id uuid primary key default gen_random_uuid(),
  sprint_assignment_id uuid references sprint_assignments(id) on delete cascade,
  submitted_at timestamptz default now(),
  notes text,
  week_number int not null check (week_number in (1, 2)),
  unique(sprint_assignment_id, week_number)
);

-- RLS
alter table sprints enable row level security;
alter table sprint_assignments enable row level security;
alter table sprint_deliverables enable row level security;
alter table sprint_checkins enable row level security;

create policy "sprints_all" on sprints for all using (auth.uid() is not null);
create policy "sprint_assignments_all" on sprint_assignments for all using (auth.uid() is not null);
create policy "sprint_deliverables_all" on sprint_deliverables for all using (auth.uid() is not null);
create policy "sprint_checkins_all" on sprint_checkins for all using (auth.uid() is not null);
