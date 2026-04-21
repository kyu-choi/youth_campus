(function () {
  window.App = window.App || {};

  function openLink(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.App.openLink = openLink;
})();
