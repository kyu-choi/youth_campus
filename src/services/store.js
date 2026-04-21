(function () {
  window.App = window.App || {};

  const STORAGE_KEY = "youth-campus-store-v2";

  function createDefaults() {
    return {
      profiles: [],
      rotationApplications: [],
      matchProfiles: [],
      matchApplications: [],
      matches: [],
      reviews: [],
      adminNotes: []
    };
  }

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(createDefaults()));
  }

  function parseStored(value) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function readStore() {
    if (!window.localStorage) {
      return cloneDefaults();
    }

    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));

    if (!stored) {
      return cloneDefaults();
    }

    return Object.assign(cloneDefaults(), stored);
  }

  function writeStore(store) {
    if (window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    return store;
  }

  function mutateStore(mutator) {
    const store = readStore();
    const result = mutator(store) || store;
    writeStore(result);
    return result;
  }

  function createId(prefix) {
    return [prefix, Date.now(), Math.random().toString(36).slice(2, 8)].join("-");
  }

  window.App.storeService = {
    STORAGE_KEY: STORAGE_KEY,
    readStore: readStore,
    writeStore: writeStore,
    mutateStore: mutateStore,
    createId: createId
  };
})();
