(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function ButtonCard(config) {
    return e(
      "a",
      {
        className: "feature-card",
        href: config.href
      },
      e(
        "div",
        { className: "feature-card-head" },
        e("span", { className: "feature-card-kicker" }, config.kicker || "바로가기"),
        e("h3", { className: "feature-card-title" }, config.title)
      ),
      e("p", { className: "feature-card-description" }, config.description),
      config.meta
        ? e("p", { className: "feature-card-meta" }, config.meta)
        : null
    );
  }

  window.App.ButtonCard = ButtonCard;
})();
