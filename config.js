const SUPABASE_URL =
  "https://zlafcarhdhtugcmeaqzv.supabase.co";

/*
  只可以使用 Publishable key 或 anon public key。
  絕對不要把 service_role key 放在這裡。
*/
const SUPABASE_KEY =
  "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

window.db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

