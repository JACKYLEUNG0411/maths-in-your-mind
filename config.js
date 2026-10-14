(() => {
  "use strict";

  const runtimeConfig =
    window.__MATH_UNIVERSE_CONFIG__;

  if (
    !runtimeConfig ||
    typeof runtimeConfig !== "object"
  ) {
    throw new Error(
      "找不到執行環境設定。請先載入 app-config.js。"
    );
  }

  const host = window.location.hostname;
  const defaultEnvironment =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(host)
      ? "development"
      : "production";

  const environment =
    runtimeConfig.activeEnvironment ||
    defaultEnvironment;

  const selectedConfig =
    runtimeConfig.environments?.[environment];

  const SUPABASE_URL =
    selectedConfig?.supabaseUrl || "";

  const SUPABASE_KEY =
    selectedConfig?.supabaseKey || "";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      `環境設定不完整（${environment}）。請檢查 app-config.js。`
    );
  }

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

  window.appRuntime = {
    environment
  };
})();
