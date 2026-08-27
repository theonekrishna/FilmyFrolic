import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zltiweldparfuruycapc.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdGl3ZWxkcGFyZnVydXljYXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzkzMjUsImV4cCI6MjA4OTMxNTMyNX0.NWJTq6Ck7jPNLl9PCgVjQWtOhiONbsJWxb2nLVRSEMU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
