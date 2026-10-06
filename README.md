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

Apply [`supabase/migrations/0001_waitlist.sql`](supabase/migrations/0001_waitlist.sql)
(via the Supabase MCP `apply_migration`, or paste into the SQL editor). It creates
`public.waitlist`, enables RLS, and adds an **insert-only** policy for `anon` —
anonymous visitors can insert and nothing else, so there is no public read-back.

The required GDPR consent is persisted per-field as `consent_gdpr` (the table also
enforces `check (consent_gdpr)`), alongside the optional `consent_marketing` flag.

## Verify the capture endpoint (CAS-232)

```bash
SUPABASE_URL="https://<project>.supabase.co" \
SUPABASE_ANON_KEY="<anon public key>" \
SUPABASE_SERVICE_KEY="<service key, optional>" \
bash supabase/verify-capture.sh
```

It asserts: anon INSERT returns `201`, anon SELECT is denied (no PII exposure),
and — when the service key is present — the test row is actually stored.

## Validate the migration locally (no Supabase account)

```bash
bash supabase/local-rls-test.sh
```

Runs a throwaway Postgres 16 container, applies the migration verbatim, and proves the
security properties the public form depends on: anon INSERT succeeds, anon SELECT/UPDATE
are denied (no PII read-back), `consent_gdpr` is enforced, and the service role can read
the row. Requires only `docker`.

> `POST /rest/v1/waitlist` must be sent with `Prefer: return=minimal` (the form does).
> The `anon` role has INSERT but no SELECT, so a `return=representation` request would be
> rejected — minimal is both cheaper and consistent with the insert-only grant.

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
