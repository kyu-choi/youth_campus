window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.services = window.CheongchunCampus.services || {};

window.CheongchunCampus.services.isSupabaseEnabled =
  function isSupabaseEnabled() {
    const { supabaseConfig } = window.CheongchunCampus.config;

    return Boolean(
      supabaseConfig.enabled &&
        supabaseConfig.url &&
        supabaseConfig.anonKey &&
        window.supabase?.createClient
    );
  };

window.CheongchunCampus.services.getSupabaseClient =
  function getSupabaseClient() {
    const { supabaseConfig } = window.CheongchunCampus.config;

    if (!window.CheongchunCampus.services.isSupabaseEnabled()) {
      return null;
    }

    return window.supabase.createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );
  };
