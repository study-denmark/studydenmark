-- Move RLS helper functions out of the exposed API schema
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.is_admin() set schema private;
alter function public.has_active_subscription() set schema private;

create or replace function public.protect_profile_columns()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    new.role := old.role;
    new.stripe_customer_id := old.stripe_customer_id;
    new.email := old.email;
  end if;
  return new;
end $$;
revoke execute on function public.protect_profile_columns() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
