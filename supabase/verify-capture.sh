#!/usr/bin/env bash
# Verify the CasaCraft waitlist capture endpoint end-to-end (CAS-232).
#
# Usage:
#   SUPABASE_URL="https://xxxx.supabase.co" \
#   SUPABASE_ANON_KEY="eyJ..." \
#   [SUPABASE_SERVICE_KEY="eyJ..."] \
#   bash supabase/verify-capture.sh
#
# What it proves:
#   1. POST /rest/v1/waitlist with the public anon key returns success (201).
#   2. (optional, with service key) the row is actually stored.
#   3. (optional, with service key) the anon key CANNOT read rows back (no PII exposure).
set -u

: "${SUPABASE_URL:?set SUPABASE_URL (e.g. https://xxxx.supabase.co)}"
: "${SUPABASE_ANON_KEY:?set SUPABASE_ANON_KEY}"
TABLE="${TABLE:-waitlist}"
BASE="${SUPABASE_URL%/}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TEST_EMAIL="cto-verify+${STAMP}@example.com"

payload=$(cat <<JSON
{
  "email": "${TEST_EMAIL}",
  "first_name": "CTO-VERIFY",
  "country": "FR",
  "interests": ["argan", "tea"],
  "price_band": "40-70",
  "ship_max": "10",
  "payment_methods": ["carte_bancaire", "ideal", "bancontact"],
  "preferred_language": "fr",
  "consent_gdpr": true,
  "consent_marketing": false,
  "page_lang": "fr",
  "utm_source": "cto-verify",
  "utm_medium": "smoke-test",
  "utm_campaign": "cas-232",
  "referrer": "https://github.com/aurora2freelance-collab/casacraft-waitlist",
  "user_agent": "verify-capture.sh",
  "page_url": "https://aurora2freelance-collab.github.io/casacraft-waitlist/?utm_source=cto-verify",
  "submitted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
)

echo "== 1. anon INSERT ${BASE}/rest/v1/${TABLE}"
code=$(curl -sS -o /tmp/vc_insert.out -w '%{http_code}' \
  -X POST "${BASE}/rest/v1/${TABLE}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  --data "${payload}")
echo "HTTP ${code}"
if [ "${code}" != "201" ] && [ "${code}" != "200" ]; then
  echo "FAIL: expected 201/200, got ${code}"; cat /tmp/vc_insert.out; echo; exit 1
fi
echo "PASS: insert accepted"

echo "== 2. anon SELECT must be denied (no public read-back)"
rlen=$(curl -sS "${BASE}/rest/v1/${TABLE}?select=id&limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")
echo "anon select -> ${rlen}"
# With RLS insert-only, anon gets [] (or 401). Anything with an email/row is a failure.
if printf '%s' "$rlen" | grep -qE '"(email|id)"'; then
  echo "FAIL: anon can read rows back (PII exposure)"; exit 1
fi
echo "PASS: anon cannot read rows"

if [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo "== 3. service-role confirm the test row is stored"
  found=$(curl -sS "${BASE}/rest/v1/${TABLE}?email=eq.${TEST_EMAIL}&select=id,email,country,consent_gdpr" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")
  echo "service select -> ${found}"
  if printf '%s' "$found" | grep -q "${TEST_EMAIL}"; then
    echo "PASS: row persisted (${TEST_EMAIL})"
  else
    echo "FAIL: row not found by service role"; exit 1
  fi
else
  echo "== 3. skipped (no SUPABASE_SERVICE_KEY) — set it to confirm the stored row"
fi

echo "ALL CHECKS PASSED"
