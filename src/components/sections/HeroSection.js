(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function HeroSection() {
    const heroText = window.App.text.hero;
    const children = [];

    if (heroText.badge) {
      children.push(
        e("span", { key: "badge", className: "badge" }, heroText.badge)
      );
    }

    children.push(e("h1", { key: "title" }, heroText.title));
    children.push(
      e("p", { key: "description", className: "subtext" }, heroText.description)
    );

    if (heroText.detail) {
      children.push(
        e("p", { key: "detail", className: "hero-detail" }, heroText.detail)
      );
    }

    return e("section", { className: "hero" }, ...children);
  }

  window.App.HeroSection = HeroSection;
})();
