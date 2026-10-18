-- Launch waitlist: people who want an email when Study Denmark opens.
-- Inserted only by the server (service role). Admins can read and delete.
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consent_version text not null,
  source text,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);
create unique index waitlist_email_idx on public.waitlist (lower(email));
alter table public.waitlist enable row level security;
create policy "waitlist: admin read" on public.waitlist
  for select to authenticated using ((select private.is_admin()));
create policy "waitlist: admin delete" on public.waitlist
  for delete to authenticated using ((select private.is_admin()));
