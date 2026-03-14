-- ============================================================
-- RLS Policies — Cloud Closet Ops
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to re-run: each block drops the old policy before recreating.
-- ============================================================

-- ─── Helper: drop policy if it exists ───────────────────────
-- (PostgreSQL 15 doesn't support CREATE POLICY IF NOT EXISTS,
--  so we drop-then-create for idempotency.)


-- ────────────────────────────────────────────────────────────
-- announcements
-- ────────────────────────────────────────────────────────────
alter table public.announcements enable row level security;

drop policy if exists "Auth users view announcements"   on public.announcements;
drop policy if exists "Admins manage announcements"     on public.announcements;
drop policy if exists "Admins insert announcements"     on public.announcements;

create policy "Auth users view announcements"
  on public.announcements for select
  using (auth.uid() is not null);

create policy "Admins insert announcements"
  on public.announcements for insert
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Admins manage announcements"
  on public.announcements for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- tasks
-- ────────────────────────────────────────────────────────────
alter table public.tasks enable row level security;

drop policy if exists "Auth users view tasks"       on public.tasks;
drop policy if exists "Admins insert tasks"         on public.tasks;
drop policy if exists "Owner or admin update tasks" on public.tasks;
drop policy if exists "Admins delete tasks"         on public.tasks;

create policy "Auth users view tasks"
  on public.tasks for select
  using (auth.uid() is not null);

create policy "Admins insert tasks"
  on public.tasks for insert
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Owner or admin update tasks"
  on public.tasks for update
  using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete tasks"
  on public.tasks for delete
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- events
-- ────────────────────────────────────────────────────────────
alter table public.events enable row level security;

drop policy if exists "Auth users view events"      on public.events;
drop policy if exists "Auth users create events"    on public.events;
drop policy if exists "Owner or admin update events" on public.events;
drop policy if exists "Admins delete events"        on public.events;

create policy "Auth users view events"
  on public.events for select
  using (auth.uid() is not null);

create policy "Auth users create events"
  on public.events for insert
  with check (auth.uid() is not null);

create policy "Owner or admin update events"
  on public.events for update
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete events"
  on public.events for delete
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- requests
-- ────────────────────────────────────────────────────────────
alter table public.requests enable row level security;

drop policy if exists "Interns view own requests"       on public.requests;
drop policy if exists "Interns create requests"         on public.requests;
drop policy if exists "Interns/admins update requests"  on public.requests;
drop policy if exists "Admins delete requests"          on public.requests;

create policy "Interns view own requests"
  on public.requests for select
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Interns create requests"
  on public.requests for insert
  with check (auth.uid() is not null);

create policy "Interns/admins update requests"
  on public.requests for update
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete requests"
  on public.requests for delete
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- weekly_reports
-- ────────────────────────────────────────────────────────────
alter table public.weekly_reports enable row level security;

drop policy if exists "Interns view own reports"      on public.weekly_reports;
drop policy if exists "Interns insert reports"        on public.weekly_reports;
drop policy if exists "Interns update own reports"    on public.weekly_reports;
drop policy if exists "Admins manage reports"         on public.weekly_reports;

create policy "Interns view own reports"
  on public.weekly_reports for select
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Interns insert reports"
  on public.weekly_reports for insert
  with check (auth.uid() is not null);

create policy "Interns update own reports"
  on public.weekly_reports for update
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins manage reports"
  on public.weekly_reports for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- resources
-- ────────────────────────────────────────────────────────────
alter table public.resources enable row level security;

drop policy if exists "Auth users view resources"  on public.resources;
drop policy if exists "Admins manage resources"    on public.resources;
drop policy if exists "Admins insert resources"    on public.resources;

create policy "Auth users view resources"
  on public.resources for select
  using (auth.uid() is not null);

create policy "Admins insert resources"
  on public.resources for insert
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Admins manage resources"
  on public.resources for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- settings
-- ────────────────────────────────────────────────────────────
alter table public.settings enable row level security;

drop policy if exists "Auth users view settings" on public.settings;
drop policy if exists "Admins manage settings"   on public.settings;
drop policy if exists "Admins insert settings"   on public.settings;

create policy "Auth users view settings"
  on public.settings for select
  using (auth.uid() is not null);

create policy "Admins insert settings"
  on public.settings for insert
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Admins manage settings"
  on public.settings for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- outreach_logs
-- ────────────────────────────────────────────────────────────
alter table public.outreach_logs enable row level security;

drop policy if exists "Interns view own outreach"    on public.outreach_logs;
drop policy if exists "Interns insert outreach"      on public.outreach_logs;
drop policy if exists "Interns update own outreach"  on public.outreach_logs;
drop policy if exists "Admins manage outreach"       on public.outreach_logs;

create policy "Interns view own outreach"
  on public.outreach_logs for select
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Interns insert outreach"
  on public.outreach_logs for insert
  with check (auth.uid() is not null);

create policy "Interns update own outreach"
  on public.outreach_logs for update
  using (
    intern_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins manage outreach"
  on public.outreach_logs for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- questions
-- ────────────────────────────────────────────────────────────
alter table public.questions enable row level security;

drop policy if exists "Auth users view questions"  on public.questions;
drop policy if exists "Auth users ask questions"   on public.questions;
drop policy if exists "Admins manage questions"    on public.questions;

create policy "Auth users view questions"
  on public.questions for select
  using (auth.uid() is not null);

create policy "Auth users ask questions"
  on public.questions for insert
  with check (auth.uid() is not null);

create policy "Admins manage questions"
  on public.questions for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- question_replies
-- ────────────────────────────────────────────────────────────
alter table public.question_replies enable row level security;

drop policy if exists "Auth users view replies"   on public.question_replies;
drop policy if exists "Auth users post replies"   on public.question_replies;
drop policy if exists "Admins manage replies"     on public.question_replies;

create policy "Auth users view replies"
  on public.question_replies for select
  using (auth.uid() is not null);

create policy "Auth users post replies"
  on public.question_replies for insert
  with check (auth.uid() is not null);

create policy "Admins manage replies"
  on public.question_replies for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));


-- ────────────────────────────────────────────────────────────
-- activity_log
-- ────────────────────────────────────────────────────────────
alter table public.activity_log enable row level security;

drop policy if exists "Auth users view activity"   on public.activity_log;
drop policy if exists "Auth users log activity"    on public.activity_log;
drop policy if exists "Admins manage activity"     on public.activity_log;

create policy "Auth users view activity"
  on public.activity_log for select
  using (auth.uid() is not null);

create policy "Auth users log activity"
  on public.activity_log for insert
  with check (auth.uid() is not null);

create policy "Admins manage activity"
  on public.activity_log for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));
