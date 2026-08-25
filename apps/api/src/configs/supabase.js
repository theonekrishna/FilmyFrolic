const { createClient } = require("@supabase/supabase-js");

function formatSupabaseUrl(url) {
  if (!url) return "";
  if (url.includes("supabase.com/dashboard/project/")) {
    const match = url.match(/project\/([a-z0-9]+)/);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }
  return url.replace(/\/$/, "");
}

const rawUrl = process.env.SUPABASE_URL;
const supabaseUrl = formatSupabaseUrl(rawUrl);
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabase, supabaseAdmin };
