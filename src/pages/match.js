(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function MatchPage() {
    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "프로필 기반 소개팅"),
        e("h1", { className: "hero-title" }, "1대1 소개팅"),
        e(
          "p",
          { className: "hero-description" },
          "기본 정보와 선호 조건, 선호 스타일 우선순위를 바탕으로 잘 맞는 상대를 연결하는 1대1 소개팅입니다."
        ),
        e(
          "a",
          { className: "hero-cta", href: window.App.getRoute("matchApply").path },
          "1대1 신청하기"
        )
      ),
      window.App.renderSection({
        title: "매칭 원칙",
        description: "입력한 조건과 선호 스타일 우선순위를 바탕으로 조화로운 만남을 우선 연결합니다.",
        content: e(
          "div",
          { className: "info-grid" },
          ...window.App.text.match.principles.map(function (item) {
            return e(
              "article",
              { key: item, className: "info-card" },
              e("strong", null, item)
            );
          })
        )
      }),
      window.App.renderSection({
        title: "진행 흐름",
        description: "신청부터 결과 안내까지 다음 순서로 진행됩니다.",
        content: e(
          "div",
          { className: "timeline-list" },
          ...[
            "신청서 접수",
            "입력 정보 확인",
            "조건에 맞는 상대 연결",
            "매칭 결과 안내",
            "연락 및 일정 조율"
          ].map(function (item, index) {
            return e(
              "div",
              { key: item, className: "timeline-item" },
              e("span", { className: "timeline-index" }, index + 1),
              e("p", null, item)
            );
          })
        )
      })
    );
  }

  window.App.registerPage("match", MatchPage);
})();
