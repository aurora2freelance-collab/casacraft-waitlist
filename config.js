/* CasaCraft waitlist — runtime config.
   The capture endpoint is wired once the Supabase connection is authorised.
   While these are empty the page stays in "preview" mode: it does NOT claim a
   successful signup (no silent data loss, no misleading confirmation). */
window.CASACRAFT_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  table: "waitlist"
};
