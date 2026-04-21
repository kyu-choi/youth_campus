(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function SiteHeader(config) {
    const items = window.App.getNavigationItems(config.currentPage);

    return e(
      "header",
      { className: "site-header" },
      e(
        "a",
        { className: "brand-link", href: window.App.getRoute("home").path },
        e("span", { className: "brand-mark" }, "YC"),
        e(
          "span",
          { className: "brand-copy" },
          e("strong", null, window.App.text.brand.name),
          e("span", null, window.App.text.brand.slogan)
        )
      ),
      e(
        "nav",
        { className: "top-nav", "aria-label": "주요 메뉴" },
        ...items.map(function (item) {
          const className =
            item.id === config.currentPage ? "nav-link is-active" : "nav-link";

          return e(
            "a",
            { key: item.id, className: className, href: item.path },
            item.label
          );
        })
      )
    );
  }

  function App() {
    const pageId = document.body.dataset.page || "home";
    const route = window.App.getRoute(pageId);
    const PageComponent = route.component;

    document.title = route.title + " | " + window.App.text.brand.name;

    if (!PageComponent) {
      return e(
        "div",
        { className: "site-shell" },
        e(SiteHeader, { currentPage: pageId }),
        e(
          "main",
          { className: "page-shell" },
          window.App.renderSection({
            title: "페이지를 찾을 수 없습니다.",
            description: "라우팅 설정과 페이지 스크립트를 확인해 주세요.",
            content: e(
              "a",
              { className: "inline-link", href: window.App.getRoute("home").path },
              "메인으로 이동"
            )
          })
        )
      );
    }

    return e(
      "div",
      { className: "site-shell" },
      e(SiteHeader, { currentPage: pageId }),
      e(
        "main",
        { className: "page-shell" },
        e(PageComponent)
      ),
      e(
        "footer",
        { className: "site-footer" },
        e("p", null, window.App.text.brand.slogan),
        window.App.supabase.notice
          ? e("p", { className: "footer-note" }, window.App.supabase.notice)
          : null
      )
    );
  }

  window.App.App = App;
})();
