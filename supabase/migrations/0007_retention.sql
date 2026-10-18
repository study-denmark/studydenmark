-- Automatic deletion, as promised in the privacy policy:
--   * uploaded documents: 12 months after the member's last membership ended
--   * accounts: no active membership AND no login for 24 months
-- Admins are never touched. The job itself runs daily from /api/cron/retention.

create table public.retention_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  documents_deleted integer not null default 0,
  users_deleted integer not null default 0,
  errors text
);
alter table public.retention_runs enable row level security;
create policy "retention_runs: admin read" on public.retention_runs
  for select to authenticated using ((select private.is_admin()));

-- Documents whose owner has had no live membership for 12 months
create or replace function public.retention_documents_due()
returns table (id uuid, user_id uuid, storage_path text)
language sql stable security definer
set search_path = ''
as $$
  with ends as (
    select s.user_id,
           bool_or(s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end > now())) as live,
           max(coalesce(s.current_period_end, s.updated_at)) as last_end
    from public.subscriptions s
    group by s.user_id
  )
  select d.id, d.user_id, d.storage_path
  from public.documents d
  join public.profiles p on p.id = d.user_id
  left join ends e on e.user_id = d.user_id
  where p.role <> 'admin'
    and not coalesce(e.live, false)
    and coalesce(e.last_end, d.created_at) < now() - interval '12 months';
$$;

-- Accounts with no live membership whose membership ended (or account was created) 24+ months ago
-- and who have not logged in for 24 months
create or replace function public.retention_users_due()
returns table (user_id uuid)
language sql stable security definer
set search_path = ''
as $$
  with ends as (
    select s.user_id,
           bool_or(s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end > now())) as live,
           max(coalesce(s.current_period_end, s.updated_at)) as last_end
    from public.subscriptions s
    group by s.user_id
  )
  select p.id
  from public.profiles p
  join auth.users u on u.id = p.id
  left join ends e on e.user_id = p.id
  where p.role <> 'admin'
    and not coalesce(e.live, false)
    and coalesce(e.last_end, p.created_at) < now() - interval '24 months'
    and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '24 months';
$$;

revoke execute on function public.retention_documents_due() from public, anon, authenticated;
revoke execute on function public.retention_users_due() from public, anon, authenticated;
grant execute on function public.retention_documents_due() to service_role;
grant execute on function public.retention_users_due() to service_role;
