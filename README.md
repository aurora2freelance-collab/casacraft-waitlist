# CasaCraft — Pre-launch diaspora waitlist

Free, store-independent waitlist for the CasaCraft EU Moroccan-diaspora launch.
Built for **[CAS-227](/CAS/issues/CAS-227)**. No paid spend, no storefront, no custom domain.

- **Live (GitHub Pages):** https://aurora2freelance-collab.github.io/casacraft-waitlist/
- **Capture backend:** Supabase REST (`waitlist` table, insert-only RLS) — wired in `config.js`
- **No stock photography, no delivery-date promises.**

## What the form collects

Email (required) · first name · **country** (FR/BE/NL/DE/IT/ES/Other EU) · collection interest
(tea / argan / spices / textiles / poufs / tagines) · tea-set budget band · max acceptable
delivery time · preferred payment methods · preferred message language · GDPR consent
(required) + optional marketing consent.

It also stores `utm_*`, referrer, page language, user agent and timestamp so we can report
**engagement by country and by creative language** (FR / EN / Darija).

## Capture contract

`config.js`:

```js
window.CASACRAFT_CONFIG = {
  supabaseUrl: "https://<project>.supabase.co",
  supabaseAnonKey: "<anon public key>",
  table: "waitlist"
};
```

The page POSTs to `POST {supabaseUrl}/rest/v1/waitlist` with the public anon key. The key is
safe to expose **only** because the table uses RLS with an insert-only policy for the `anon`
role (no select). While `supabaseUrl`/`supabaseAnonKey` are empty the page shows
"signups not open yet" and does **not** fake a successful signup.

## Supabase setup (migrations)

```sql
create table if not exists public.waitlist (
  id                bigint generated always as identity primary key,
  email             text not null,
  first_name        text,
  country           text not null,
  interests         text[] default '{}',
  price_band        text,
  ship_max          text,
  payment_methods   text[] default '{}',
  preferred_language text,
  consent_marketing boolean default false,
  page_lang         text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  referrer          text,
  user_agent        text,
  page_url          text,
  submitted_at      timestamptz default now()
);

alter table public.waitlist enable row level security;

-- anonymous visitors may insert only
create policy "anon insert waitlist"
  on public.waitlist for insert to anon
  with check (true);
```

## Tracked links (create after the capture endpoint is live)

| Channel / creative | URL |
|---|---|
| FR — Facebook diaspora groups | `?utm_source=facebook&utm_medium=organic&utm_campaign=prelaunch-diaspora&utm_content=lang-fr` |
| EN — Instagram / TikTok bio | `?utm_source=instagram&utm_medium=organic&utm_campaign=prelaunch-diaspora&utm_content=lang-en` |
| Darija — WhatsApp / community | `?utm_source=whatsapp&utm_medium=community&utm_campaign=prelaunch-diaspora&utm_content=lang-darija` |
| BE — Bancontact angle | `?utm_source=facebook_be&utm_medium=organic&utm_campaign=prelaunch-diaspora&utm_content=be` |
| NL — iDEAL angle | `?utm_source=facebook_nl&utm_medium=organic&utm_campaign=prelaunch-diaspora&utm_content=nl` |

## Deploy

Static site, GitHub Pages (`main` branch, root). Push to `main`; Pages redeploys automatically.
