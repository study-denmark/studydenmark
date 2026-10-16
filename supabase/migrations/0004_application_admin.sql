-- Commercial/internal fields must never be readable by the student who owns the application.
create table public.application_admin (
  application_id uuid primary key references public.applications(id) on delete cascade,
  commission_amount_eur integer,
  commission_status text not null default 'none' check (commission_status in ('none','expected','invoiced','paid','not_due')),
  commission_invoiced_at timestamptz,
  commission_paid_at timestamptz,
  internal_notes text,
  updated_at timestamptz not null default now()
);
create trigger application_admin_updated_at before update on public.application_admin
  for each row execute function public.set_updated_at();
alter table public.application_admin enable row level security;
create policy "application_admin: admin all" on public.application_admin
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- Old commercial columns on applications are deprecated and hidden from the API.
revoke select, insert, update on public.applications from anon, authenticated;
grant select (id, user_id, programme_id, institution_id, stage, share_consent_at, share_consent_version,
              sent_to_school_at, admitted_at, started_at, created_at, updated_at)
  on public.applications to authenticated;
grant insert (user_id, programme_id, institution_id, stage, share_consent_at, share_consent_version)
  on public.applications to authenticated;
grant update (stage, sent_to_school_at, admitted_at, started_at)
  on public.applications to authenticated;

-- Admins may use student features (upload, apply, save) for testing
alter policy "documents: subscribers upload own" on public.documents
  with check (user_id = (select auth.uid()) and status = 'uploaded' and reviewed_by is null
    and ((select private.has_active_subscription()) or (select private.is_admin())));
alter policy "storage: subscribers upload own files" on storage.objects
  with check (bucket_id = 'student-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
    and ((select private.has_active_subscription()) or (select private.is_admin())));
alter policy "applications: subscribers create own with consent" on public.applications
  with check (user_id = (select auth.uid()) and stage = 'interested' and commission_amount_eur is null
    and ((select private.has_active_subscription()) or (select private.is_admin())));
alter policy "saved: insert own (subscribers)" on public.saved_programmes
  with check (user_id = (select auth.uid()) and ((select private.has_active_subscription()) or (select private.is_admin())));
