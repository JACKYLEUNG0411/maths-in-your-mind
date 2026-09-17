(() => {
  "use strict";

  const SUPABASE_URL =
    "https://zlafcarhdhtugcmeaqzv.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

  if (
    !window.supabase ||
    typeof window.supabase.createClient !==
      "function"
  ) {
    throw new Error(
      "Supabase JavaScript SDK 尚未載入。"
    );
  }

  window.db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
