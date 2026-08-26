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

let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    console.log("[SUPABASE] client initialized successfully");
  } catch (err) {
    console.error("[SUPABASE ERROR] client initialization failed:", err.message);
  }
} else {
  console.warn("[SUPABASE WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
  // Return dummy client to prevent runtime crash
  const dummyClient = createClient("https://placeholder.supabase.co", "placeholder-key");
  supabase = dummyClient;
  supabaseAdmin = dummyClient;
}

module.exports = { supabase, supabaseAdmin };
