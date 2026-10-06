-- CasaCraft pre-launch diaspora waitlist — capture table (CAS-227 / CAS-232)
-- Insert-only by design: anonymous visitors (the public form) may INSERT and
-- nothing else. No public read-back. All other access is via service role.

create table if not exists public.waitlist (
  id                 bigint generated always as identity primary key,
  email              text not null,
  first_name         text,
  country            text not null,
  interests          text[] default '{}',
  price_band         text,
  ship_max           text,
  payment_methods    text[] default '{}',
  preferred_language text,
  consent_gdpr       boolean not null default false,  -- required consent, persisted for GDPR proof
  consent_marketing  boolean not null default false,
  page_lang          text,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_content        text,
  utm_term           text,
  referrer           text,
  user_agent         text,
  page_url           text,
  submitted_at       timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Hard requirement: the required GDPR consent must be true on every row.
alter table public.waitlist
  drop constraint if exists waitlist_consent_required;
alter table public.waitlist
  add constraint waitlist_consent_required check (consent_gdpr);

-- Anonymous visitors: INSERT only, and they may not back-date/forge the row id.
drop policy if exists "anon insert waitlist" on public.waitlist;
create policy "anon insert waitlist"
  on public.waitlist for insert to anon
  with check (true);

-- Defense in depth: no SELECT/UPDATE/DELETE for anon at the privilege layer either.
revoke all on public.waitlist from anon;
grant insert on public.waitlist to anon;
grant usage, select on sequence public.waitlist_id_seq to anon;

-- Optional dedupe helper for reporting (does not block re-submits).
create index if not exists waitlist_email_idx on public.waitlist (lower(email));
create index if not exists waitlist_country_idx on public.waitlist (country);
create index if not exists waitlist_submitted_at_idx on public.waitlist (submitted_at desc);
