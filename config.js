const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

window.db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
