-- =====================================================================
-- Row Level Security + private storage bucket
-- Rule of thumb: students see only their own rows; admins see everything;
-- subscriptions/payments are written only by the server (service role).
-- =====================================================================

alter table public.profiles                      enable row level security;
alter table public.consents                      enable row level security;
alter table public.subscriptions                 enable row level security;
alter table public.payments                      enable row level security;
alter table public.institutions                  enable row level security;
alter table public.partner_agreements            enable row level security;
alter table public.programmes                    enable row level security;
alter table public.programme_required_documents  enable row level security;
alter table public.saved_programmes              enable row level security;
alter table public.documents                     enable row level security;
alter table public.applications                  enable row level security;
alter table public.application_stage_history     enable row level security;
alter table public.document_shares               enable row level security;

-- ---------- profiles ----------
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- ---------- consents ----------
create policy "consents: read own or admin" on public.consents
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "consents: insert own" on public.consents
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "consents: revoke own" on public.consents
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------- subscriptions / payments (read-only for users) ----------
create policy "subscriptions: read own or admin" on public.subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "payments: read own or admin" on public.payments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- institutions (public catalogue) ----------
create policy "institutions: public read" on public.institutions
  for select to anon, authenticated using (true);
create policy "institutions: admin insert" on public.institutions
  for insert to authenticated with check ((select public.is_admin()));
create policy "institutions: admin update" on public.institutions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "institutions: admin delete" on public.institutions
  for delete to authenticated using ((select public.is_admin()));

-- ---------- partner_agreements (admin only) ----------
create policy "partner_agreements: admin all" on public.partner_agreements
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- programmes (paywall lives here) ----------
create policy "programmes: preview is public" on public.programmes
  for select to anon
  using (is_published and is_public_preview);
create policy "programmes: subscribers see all published, admin sees all" on public.programmes
  for select to authenticated
  using (
    (is_published and (is_public_preview or (select public.has_active_subscription())))
    or (select public.is_admin())
  );
create policy "programmes: admin insert" on public.programmes
  for insert to authenticated with check ((select public.is_admin()));
create policy "programmes: admin update" on public.programmes
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "programmes: admin delete" on public.programmes
  for delete to authenticated using ((select public.is_admin()));

create policy "required_documents: subscribers and admin read" on public.programme_required_documents
  for select to authenticated
  using ((select public.has_active_subscription()) or (select public.is_admin()));
create policy "required_documents: admin insert" on public.programme_required_documents
  for insert to authenticated with check ((select public.is_admin()));
create policy "required_documents: admin update" on public.programme_required_documents
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "required_documents: admin delete" on public.programme_required_documents
  for delete to authenticated using ((select public.is_admin()));

-- ---------- saved_programmes ----------
create policy "saved: read own" on public.saved_programmes
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "saved: insert own (subscribers)" on public.saved_programmes
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.has_active_subscription()));
create policy "saved: delete own" on public.saved_programmes
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------- documents ----------
create policy "documents: read own or admin" on public.documents
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "documents: subscribers upload own" on public.documents
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'uploaded'
    and reviewed_by is null
    and (select public.has_active_subscription())
  );
create policy "documents: admin review" on public.documents
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "documents: delete own or admin" on public.documents
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- applications ----------
create policy "applications: read own or admin" on public.applications
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "applications: subscribers create own with consent" on public.applications
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and stage = 'interested'
    and commission_amount_eur is null
    and (select public.has_active_subscription())
  );
create policy "applications: admin update" on public.applications
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "applications: admin delete" on public.applications
  for delete to authenticated using ((select public.is_admin()));

create policy "stage_history: read own or admin" on public.application_stage_history
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.applications a
               where a.id = application_id and a.user_id = (select auth.uid()))
  );

-- ---------- document_shares (students can see who got their data) ----------
create policy "document_shares: read own or admin" on public.document_shares
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "document_shares: admin insert" on public.document_shares
  for insert to authenticated with check ((select public.is_admin()));

-- ---------- Private storage bucket for student documents ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-documents', 'student-documents', false, 10485760,
  array['application/pdf','image/jpeg','image/png','image/heic','image/webp']
)
on conflict (id) do nothing;

-- Files live under '{user_id}/...'
create policy "storage: students read own files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'student-documents'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );
create policy "storage: subscribers upload own files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.has_active_subscription())
  );
create policy "storage: students delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'student-documents'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );

-- Lock down security-definer helpers to the roles that need them
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_active_subscription() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_active_subscription() to authenticated;
revoke execute on function public.count_published_programmes(public.programme_level) from public;
grant execute on function public.count_published_programmes(public.programme_level) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_application_stage() from public, anon, authenticated;
