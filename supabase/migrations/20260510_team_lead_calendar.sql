-- Allow team leads (team_exec role) to manage company calendar events
create policy "team leads can manage events"
  on public.company_events for all
  using (
    exists (
      select 1 from public.user_team_roles
      where user_id = auth.uid()
      and role = 'team_exec'
    )
  )
  with check (
    exists (
      select 1 from public.user_team_roles
      where user_id = auth.uid()
      and role = 'team_exec'
    )
  );
