(function () {
  window.App = window.App || {};

  const SESSION_KEY = "youth-campus-admin-session";
  const ACCESS_KEY_STORAGE_KEY = "youth-campus-admin-access-key";

  function normalize(value) {
    return window.App.validators.normalize(value);
  }

  function canUseStorage(type) {
    try {
      return Boolean(window[type]);
    } catch {
      return false;
    }
  }

  function isLoggedIn() {
    if (!canUseStorage("sessionStorage")) {
      return false;
    }

    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function getLocalAccessKey() {
    if (!canUseStorage("localStorage")) {
      return "";
    }

    return normalize(window.localStorage.getItem(ACCESS_KEY_STORAGE_KEY));
  }

  function hasLocalAccessKey() {
    return getLocalAccessKey() !== "";
  }

  function getAuthState() {
    return {
      mode: window.App.supabase.enabled ? "supabase_auth" : "local_session_fallback",
      hasLocalAccessKey: hasLocalAccessKey()
    };
  }

  function initializeLocalAccessKey(accessKey) {
    const normalized = normalize(accessKey);

    if (!normalized || !canUseStorage("localStorage")) {
      return false;
    }

    window.localStorage.setItem(ACCESS_KEY_STORAGE_KEY, normalized);

    if (canUseStorage("sessionStorage")) {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }

    return true;
  }

  function login(accessKey) {
    const normalized = normalize(accessKey);
    const storedAccessKey = getLocalAccessKey();

    if (!normalized || !storedAccessKey || normalized !== storedAccessKey) {
      return false;
    }

    if (canUseStorage("sessionStorage")) {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }

    return true;
  }

  function logout() {
    if (canUseStorage("sessionStorage")) {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function addAdminNote(targetType, targetId, note, adminAction) {
    const normalized = normalize(note);

    if (!normalized) {
      return null;
    }

    const record = {
      id: window.App.storeService.createId("admin-note"),
      target_type: targetType,
      target_id: targetId,
      note: normalized,
      admin_action: adminAction || "memo",
      created_at: window.App.profilesService.nowIso()
    };

    window.App.storeService.mutateStore(function (store) {
      store.adminNotes.unshift(record);
      return store;
    });

    return record;
  }

  function listAdminNotes(targetType, targetId) {
    return window.App.storeService
      .readStore()
      .adminNotes.filter(function (record) {
        return record.target_type === targetType && record.target_id === targetId;
      })
      .sort(function (left, right) {
        return new Date(right.created_at) - new Date(left.created_at);
      });
  }

  function getDashboardSnapshot() {
    const rotationApplications = window.App.rotationService.listRotationApplications();
    const matchApplications = window.App.matchingService.listMatchApplications();
    const matches = window.App.matchingService.listMatches();
    const rotationStats = window.App.rotationService.listEventStats();

    return {
      rotationApplications: rotationApplications,
      matchApplications: matchApplications,
      matches: matches,
      rotationStats: rotationStats,
      summary: {
        totalRotationApplications: rotationApplications.length,
        totalMatchApplications: matchApplications.length,
        autoCandidates: matches.filter(function (item) {
          return item.match.status === "candidate";
        }).length,
        manualCandidates: matches.filter(function (item) {
          return item.match.status === "manual_candidate";
        }).length,
        completedMatches: matches.filter(function (item) {
          return item.match.status === "completed";
        }).length
      }
    };
  }

  window.App.adminService = {
    isLoggedIn: isLoggedIn,
    getAuthState: getAuthState,
    initializeLocalAccessKey: initializeLocalAccessKey,
    login: login,
    logout: logout,
    addAdminNote: addAdminNote,
    listAdminNotes: listAdminNotes,
    getDashboardSnapshot: getDashboardSnapshot
  };
})();
