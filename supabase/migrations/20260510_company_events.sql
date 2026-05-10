create table if not exists public.company_events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  start_time      timestamptz not null,
  end_time        timestamptz,
  all_day         boolean not null default false,
  category        text not null default 'general',
  color           text,
  team_id         uuid references public.teams(id) on delete set null,
  google_meet_link text,
  location        text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now()
);

alter table public.company_events enable row level security;

create policy "authenticated users can view events"
  on public.company_events for select
  using (auth.uid() is not null);

create policy "admins can manage events"
  on public.company_events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'wisconsin_admin')
    )
  );
