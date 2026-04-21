(function () {
  window.App = window.App || {};

  function isValidHttpUrl(value) {
    if (!value) {
      return false;
    }

    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  window.App.isValidHttpUrl = isValidHttpUrl;
})();
