/**
 * Supabase keepalive worker.
 * Nge-hit REST API Supabase sesuai jadwal cron di wrangler.jsonc
 * supaya project free tier tidak di-pause karena inactivity.
 *
 * Secrets (di-set via `wrangler secret put`):
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 */
export default {
  async scheduled(_event, env, _ctx) {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      // Lempar error supaya kelihatan failed di dashboard Cloudflare (Workers > Logs)
      throw new Error(`Supabase keepalive failed: ${res.status} ${await res.text()}`);
    }

    console.log(`Supabase keepalive OK: ${res.status}`);
  }
};
