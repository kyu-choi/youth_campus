(function () {
  window.App = window.App || {};

  window.App.supabase = {
    enabled: false,
    mode: "static-local",
    url: "",
    anonKey: "",
    authMode: "local-session-fallback",
    notice: ""
  };
})();
