-- Storm reports — intern complaint/issue dump, visible only to admin
create table if not exists storms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  problem text not null,
  addressed text,
  wants_call boolean not null default false,
  created_at timestamptz default now()
);

alter table storms enable row level security;
create policy "storms_all" on storms for all using (auth.uid() is not null);
