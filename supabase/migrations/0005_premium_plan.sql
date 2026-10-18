-- Two membership plans:
--   basic   (DKK 100/yr): browse programmes, requirements, save programmes
--   premium (DKK 500/yr): everything in basic + document upload and apply-via-us
alter table public.subscriptions
  add column plan text not null default 'basic' check (plan in ('basic', 'premium'));

-- Manual memberships granted by an admin (no Stripe) use ids starting with 'manual_'
comment on column public.subscriptions.stripe_subscription_id is
  'Stripe subscription id, or manual_<uuid> for memberships granted by an admin';

create or replace function private.has_premium()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.plan = 'premium'
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;
revoke execute on function private.has_premium() from public, anon;
grant execute on function private.has_premium() to authenticated;

-- Uploading documents and applying via us now require Premium (admins keep access for testing)
alter policy "documents: subscribers upload own" on public.documents
  with check (user_id = (select auth.uid()) and status = 'uploaded' and reviewed_by is null
    and ((select private.has_premium()) or (select private.is_admin())));
alter policy "storage: subscribers upload own files" on storage.objects
  with check (bucket_id = 'student-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
    and ((select private.has_premium()) or (select private.is_admin())));
alter policy "applications: subscribers create own with consent" on public.applications
  with check (user_id = (select auth.uid()) and stage = 'interested' and commission_amount_eur is null
    and ((select private.has_premium()) or (select private.is_admin())));
