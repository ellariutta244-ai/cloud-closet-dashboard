-- ============================================================
-- Cloud Closet Ops — Full Migration
-- Paste into Supabase SQL Editor and run.
-- ============================================================

-- ─── request_types ──────────────────────────────────────────
create table if not exists public.request_types (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  icon         text default 'help',
  kind         text default 'form' check (kind in ('form','calendar')),
  calendly_ella  text default '',
  calendly_noel  text default '',
  active       boolean default true,
  created_at   timestamptz default now()
);
alter table public.request_types enable row level security;
create policy "Anyone can view request_types" on public.request_types for select using (true);
create policy "Admins manage request_types" on public.request_types for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

insert into public.request_types (id, name, description, icon, kind, calendly_ella, calendly_noel) values
  ('00000000-0000-0000-0000-000000000001', 'Schedule a Check-In',    'Book a quick 15-min check-in with Ella or Noel to discuss progress, blockers, or feedback.', 'calendar', 'calendar', 'https://calendly.com/ella-cloudcloset/checkin', ''),
  ('00000000-0000-0000-0000-000000000002', 'Merch Order',             'Request Cloud Closet merch for events, giveaways, or personal use. Include sizes and quantities.', 'shopping',  'form',     '', ''),
  ('00000000-0000-0000-0000-000000000003', 'Meeting with Caroline',   'Request a meeting with Caroline for strategy discussions, partnership reviews, or program updates.', 'coffee',    'calendar', '', 'https://calendly.com/caroline-cloudcloset/meeting'),
  ('00000000-0000-0000-0000-000000000004', 'General Question',        'Ask Ella or Noel anything that doesn''t fit the other categories. We''ll reply within 24 hours.', 'help',      'form',     '', '')
on conflict (id) do nothing;


-- ─── requests ───────────────────────────────────────────────
create table if not exists public.requests (
  id           uuid primary key default gen_random_uuid(),
  intern_id    uuid references public.profiles(id) on delete cascade,
  type_id      uuid references public.request_types(id) on delete set null,
  type_name    text,
  message      text not null,
  status       text not null default 'new' check (status in ('new','in_progress','resolved')),
  replies      jsonb not null default '[]'::jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.requests enable row level security;
create policy "Interns view own requests" on public.requests for select
  using (intern_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Interns create requests" on public.requests for insert with check (intern_id = auth.uid());
create policy "Interns/admins update requests" on public.requests for update
  using (intern_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins delete requests" on public.requests for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger requests_updated_at before update on public.requests for each row execute function public.set_updated_at();


-- ─── events ─────────────────────────────────────────────────
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  date         date,
  time         text,
  location     text,
  status       text not null default 'planning' check (status in ('planning','upcoming','completed','cancelled')),
  intern_id    uuid references public.profiles(id) on delete set null,
  team_members jsonb not null default '[]'::jsonb,
  materials    jsonb not null default '[]'::jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.events enable row level security;
create policy "Auth users view events" on public.events for select using (auth.uid() is not null);
create policy "Auth users create events" on public.events for insert with check (auth.uid() is not null);
create policy "Owner or admin update events" on public.events for update
  using (intern_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins delete events" on public.events for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();


-- ─── tech_projects ──────────────────────────────────────────
create table if not exists public.tech_projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  status       text not null default 'planning' check (status in ('planning','in_progress','completed')),
  priority     text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  owner_id     uuid references public.profiles(id) on delete set null,
  contributors jsonb not null default '[]'::jsonb,
  tech_stack   text,
  github_url   text default '',
  progress     integer not null default 0 check (progress between 0 and 100),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.tech_projects enable row level security;
create policy "Auth users view tech_projects" on public.tech_projects for select using (auth.uid() is not null);
create policy "Auth users create tech_projects" on public.tech_projects for insert with check (auth.uid() is not null);
create policy "Owner/admin update tech_projects" on public.tech_projects for update
  using (owner_id = auth.uid()
    or (contributors)::jsonb ? auth.uid()::text
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins delete tech_projects" on public.tech_projects for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create trigger tech_projects_updated_at before update on public.tech_projects for each row execute function public.set_updated_at();


-- ─── content_videos ─────────────────────────────────────────
create table if not exists public.content_videos (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid references public.profiles(id) on delete set null,
  title        text not null,
  tiktok_url   text default '',
  views        integer default 0,
  likes        integer default 0,
  comments     integer default 0,
  date_posted  date,
  status       text not null default 'draft' check (status in ('draft','published')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.content_videos enable row level security;
create policy "Auth users view content_videos" on public.content_videos for select using (auth.uid() is not null);
create policy "Creators/admins manage content" on public.content_videos for all
  using (creator_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Creators insert content" on public.content_videos for insert with check (creator_id = auth.uid());
create trigger content_videos_updated_at before update on public.content_videos for each row execute function public.set_updated_at();


-- ─── Announcements: add target_teams column ─────────────────
alter table public.announcements
  add column if not exists target_teams jsonb default null;
-- null = all interns; array of team names = targeted

-- ─── Resources: add file_url column ─────────────────────────
alter table public.resources
  add column if not exists file_url text default null;

-- ─── Storage bucket for resource file uploads ───────────────
-- Run this in the Supabase dashboard → Storage → New bucket
-- Name: resources, Public: true
-- Or via SQL (requires pg_storage extension to be enabled):
-- insert into storage.buckets (id, name, public) values ('resources', 'resources', true) on conflict do nothing;

-- ─── Enable realtime ────────────────────────────────────────
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.questions;
alter publication supabase_realtime add table public.question_replies;
