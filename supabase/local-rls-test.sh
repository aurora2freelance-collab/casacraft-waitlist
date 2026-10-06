#!/usr/bin/env bash
# Local validation of the CAS-232 waitlist migration (insert-only RLS).
#
# Runs a throwaway Postgres 16 container, applies
# supabase/migrations/0001_waitlist.sql verbatim, and proves the security
# properties the public form depends on — with no Supabase account needed.
#
#   bash supabase/local-rls-test.sh
#
# Requires: docker. Exit code 0 = all checks passed.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION="${HERE}/migrations/0001_waitlist.sql"
CID="cas-wl-pg-$$"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

cleanup(){ docker rm -f "$CID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

[ -f "$MIGRATION" ] || { echo "missing $MIGRATION"; exit 2; }

docker run -d --name "$CID" -e POSTGRES_PASSWORD=pgtest -e POSTGRES_DB=casacraft \
  postgres:16-alpine >/dev/null || { echo "could not start postgres container"; exit 2; }
echo "waiting for postgres..."
for _ in $(seq 1 60); do
  docker exec "$CID" pg_isready -U postgres -d casacraft >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$CID" pg_isready -U postgres -d casacraft >/dev/null 2>&1 \
  || { echo "postgres did not start"; exit 2; }

PSQL="docker exec -i $CID psql -v ON_ERROR_STOP=1 -U postgres -d casacraft"

# Supabase-like roles (anon == the public form).
$PSQL >/dev/null <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
SQL

$PSQL >/dev/null < "$MIGRATION" || { echo "migration failed to apply"; exit 3; }
ok "migration 0001_waitlist.sql applied cleanly"

# 1. anon INSERT succeeds (no RETURNING — the form sends Prefer: return=minimal).
out=$($PSQL -tAc "set role anon; insert into public.waitlist (email, country, consent_gdpr) values ('good@example.com','FR',true);" 2>&1)
if echo "$out" | grep -qiE 'permission denied|error'; then bad "anon INSERT rejected: $out"; else ok "anon INSERT accepted"; fi

# 2. anon cannot read rows back (no PII exposure).
out=$($PSQL -tAc "set role anon; select count(*) from public.waitlist;" 2>&1)
if echo "$out" | grep -qiE 'permission denied'; then ok "anon SELECT denied at privilege layer";
elif [ "$out" = "0" ]; then ok "anon SELECT returns 0 rows (RLS blocks read-back)";
else bad "anon SELECT exposed data: $out"; fi

# 3. consent_gdpr=false rejected by the check constraint.
out=$($PSQL -tAc "set role anon; insert into public.waitlist (email, country, consent_gdpr) values ('noconsent@example.com','FR',false);" 2>&1)
if echo "$out" | grep -q 'waitlist_consent_required'; then ok "missing GDPR consent rejected"; else bad "consent constraint not enforced: $out"; fi

# 4. service role can read the stored row back.
out=$($PSQL -tAc "select email||'|'||coalesce(country,'')||'|'||consent_gdpr from public.waitlist where email='good@example.com';" 2>&1)
if echo "$out" | grep -q 'good@example.com|FR|t'; then ok "row persisted and readable by service role"; else bad "row not found: $out"; fi

# 5. anon UPDATE denied (defense in depth).
out=$($PSQL -tAc "set role anon; update public.waitlist set email='x' where email='good@example.com';" 2>&1)
if echo "$out" | grep -qiE 'permission denied'; then ok "anon UPDATE denied"; else bad "anon UPDATE not denied: $out"; fi

echo "----- RESULT: $PASS passed, $FAIL failed -----"
exit $FAIL
