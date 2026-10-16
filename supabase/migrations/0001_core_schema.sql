-- =====================================================================
-- StudyDenmark Guide — core data model (all phases)
-- Phase 1 uses: profiles, consents, subscriptions, payments
-- Phase 2 uses: institutions, programmes, saved_programmes
-- Phase 3 uses: documents, programme_required_documents
-- Phase 4 uses: partner_agreements, applications, application_stage_history,
--               document_shares
-- =====================================================================

-- ---------- Enums ----------
create type public.user_role as enum ('student', 'admin');

create type public.education_level as enum (
  'upper_secondary',   -- high school / gymnasium
  'academy_profession',-- AP degree
  'bachelor',
  'master'
);

create type public.programme_level as enum (
  'academy_profession',     -- Erhvervsakademiuddannelse (AP), 2 years
  'professional_bachelor',  -- Professionsbachelor, 3.5-4 years
  'top_up',                 -- PBA top-up after AP, 1.5 years
  'bachelor',               -- University bachelor, 3 years
  'master'                  -- Kandidat / MSc, 2 years
);

create type public.institution_type as enum (
  'business_academy',
  'university_college',
  'university',
  'private_school',
  'other'
);

create type public.subscription_status as enum (
  'incomplete', 'incomplete_expired', 'trialing', 'active',
  'past_due', 'canceled', 'unpaid', 'paused'
);

create type public.document_type as enum (
  'passport', 'diploma', 'transcript', 'language_test',
  'cv', 'motivation_letter', 'recommendation', 'other'
);

create type public.document_status as enum ('uploaded', 'approved', 'rejected');

create type public.application_stage as enum (
  'interested',
  'documents_complete',
  'sent_to_school',
  'admitted',
  'started',
  'commission_invoiced',
  'commission_paid',
  'rejected',
  'withdrawn'
);

create type public.consent_type as enum (
  'terms', 'privacy', 'marketing', 'share_with_institution'
);

-- ---------- Generic updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'student',
  nationality text,                       -- ISO 3166-1 alpha-2
  is_eu_eea boolean,                      -- EU/EEA/Swiss => no tuition
  education_level public.education_level,
  field_of_interest text,
  english_test_type text check (english_test_type in ('IELTS','TOEFL','Cambridge','PTE','Duolingo','none')),
  english_test_score numeric(5,1),
  desired_level public.programme_level,
  desired_start text,                     -- e.g. 'September 2027'
  budget_eur_per_year integer check (budget_eur_per_year >= 0),
  onboarding_completed_at timestamptz,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- Helper functions (security definer, used in RLS) ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- Students may not escalate their own role or edit Stripe linkage
create or replace function public.protect_profile_columns()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    new.role := old.role;
    new.stripe_customer_id := old.stripe_customer_id;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------- Consents (GDPR audit trail) ----------
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type public.consent_type not null,
  version text not null,                  -- version of the text agreed to
  institution_id uuid,                    -- set for share_with_institution
  application_id uuid,                    -- set for share_with_institution
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  user_agent text
);
create index consents_user_idx on public.consents(user_id);

-- Create profile + signup consents automatically when an auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
declare
  v_version text := coalesce(new.raw_user_meta_data->>'consent_version', 'v1');
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data->>'full_name', ''));

  if (new.raw_user_meta_data->>'accepted_terms') = 'true' then
    insert into public.consents (user_id, consent_type, version)
    values (new.id, 'terms', v_version), (new.id, 'privacy', v_version);
  end if;
  if (new.raw_user_meta_data->>'accepted_marketing') = 'true' then
    insert into public.consents (user_id, consent_type, version)
    values (new.id, 'marketing', v_version);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Subscriptions & payments (written only by Stripe webhook) ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text,
  status public.subscription_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions(user_id);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null,
  status text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index payments_user_idx on public.payments(user_id);

create or replace function public.has_active_subscription()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

-- ---------- Institutions & partner agreements ----------
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type public.institution_type not null,
  city text,
  website text,
  description text,
  logo_url text,
  is_partner boolean not null default false,   -- public: shown as "Partner"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger institutions_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();

-- Commercial terms are admin-only, kept out of the public institutions table
create table public.partner_agreements (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null unique references public.institutions(id) on delete cascade,
  commission_amount_eur integer not null check (commission_amount_eur >= 0),
  payment_terms text,
  contact_name text,
  contact_email text,
  agreement_signed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger partner_agreements_updated_at before update on public.partner_agreements
  for each row execute function public.set_updated_at();

-- ---------- Programmes ----------
create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  slug text not null unique,
  title text not null,
  level public.programme_level not null,
  field text not null,
  city text not null,
  description text,
  teaching_language text not null default 'English',
  duration_months integer,
  ects integer,
  tuition_eu_eur_per_year integer default 0,
  tuition_non_eu_eur_per_year integer,
  application_deadline_eu date,
  application_deadline_non_eu date,
  intake text,                               -- e.g. 'September', 'February'
  admission_requirements text,
  language_requirements text,
  min_ielts numeric(3,1),
  min_toefl integer,
  accepted_education_levels public.education_level[] not null default '{}',
  source_url text,
  last_verified_at date,
  is_published boolean not null default false,
  is_public_preview boolean not null default false, -- visible without subscription
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index programmes_institution_idx on public.programmes(institution_id);
create index programmes_filter_idx on public.programmes(level, city, field) where is_published;
create trigger programmes_updated_at before update on public.programmes
  for each row execute function public.set_updated_at();

create table public.programme_required_documents (
  programme_id uuid not null references public.programmes(id) on delete cascade,
  document_type public.document_type not null,
  note text,
  primary key (programme_id, document_type)
);

create table public.saved_programmes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, programme_id)
);
create index saved_programmes_programme_idx on public.saved_programmes(programme_id);

-- Teaser for the free eligibility quiz: returns only a count
create or replace function public.count_published_programmes(p_level public.programme_level default null)
returns integer language sql stable security definer
set search_path = ''
as $$
  select count(*)::int from public.programmes
  where is_published and (p_level is null or level = p_level);
$$;

-- ---------- Documents ----------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type public.document_type not null,
  storage_path text not null unique,         -- '{user_id}/{uuid}-{filename}'
  file_name text not null,
  mime_type text,
  size_bytes integer,
  status public.document_status not null default 'uploaded',
  reviewer_comment text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index documents_user_idx on public.documents(user_id);
create index documents_reviewed_by_idx on public.documents(reviewed_by);

-- ---------- Applications / commission pipeline ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  stage public.application_stage not null default 'interested',
  share_consent_at timestamptz not null,      -- explicit consent to share docs
  share_consent_version text not null,
  commission_amount_eur integer,              -- snapshot at referral time
  sent_to_school_at timestamptz,
  admitted_at timestamptz,
  started_at timestamptz,
  commission_invoiced_at timestamptz,
  commission_paid_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, programme_id)
);
create index applications_programme_idx on public.applications(programme_id);
create index applications_institution_idx on public.applications(institution_id);
create index applications_stage_idx on public.applications(stage);
create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.consents
  add constraint consents_institution_fk foreign key (institution_id)
    references public.institutions(id) on delete set null,
  add constraint consents_application_fk foreign key (application_id)
    references public.applications(id) on delete set null;
create index consents_institution_idx on public.consents(institution_id);
create index consents_application_idx on public.consents(application_id);

create table public.application_stage_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_stage public.application_stage,
  to_stage public.application_stage not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  note text
);
create index stage_history_application_idx on public.application_stage_history(application_id);
create index stage_history_changed_by_idx on public.application_stage_history(changed_by);

create or replace function public.log_application_stage()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    insert into public.application_stage_history (application_id, from_stage, to_stage, changed_by)
    values (new.id, case when tg_op = 'UPDATE' then old.stage end, new.stage, (select auth.uid()));
  end if;
  return new;
end $$;
create trigger applications_stage_log after insert or update on public.applications
  for each row execute function public.log_application_stage();

-- Log of exactly which document was shared with which school, when, by whom
create table public.document_shares (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  document_type public.document_type not null,
  shared_by uuid references public.profiles(id) on delete set null,
  shared_at timestamptz not null default now(),
  method text not null default 'export'      -- 'export', 'email', 'portal'
);
create index document_shares_application_idx on public.document_shares(application_id);
create index document_shares_document_idx on public.document_shares(document_id);
create index document_shares_user_idx on public.document_shares(user_id);
create index document_shares_institution_idx on public.document_shares(institution_id);
create index document_shares_shared_by_idx on public.document_shares(shared_by);
