import { createClient } from "@supabase/supabase-js";

function formatSupabaseUrl(url) {
  if (!url) return "https://placeholder-url.supabase.co";
  if (url.includes("supabase.com/dashboard/project/")) {
    const match = url.match(/project\/([a-z0-9]+)/);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }
  return url.replace(/\/$/, "");
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = formatSupabaseUrl(rawUrl);
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
