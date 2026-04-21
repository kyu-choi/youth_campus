(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function RotationPage() {
    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "행사 신청형 서비스"),
        e("h1", { className: "hero-title" }, "로테이션 소개팅"),
        e(
          "p",
          { className: "hero-description" },
          "남자 11명, 여자 11명을 기준으로 회차별 참가자를 모집하고, 대기열까지 운영하는 행사형 흐름입니다."
        ),
        e(
          "a",
          { className: "hero-cta", href: window.App.getRoute("rotationApply").path },
          "로테이션 신청하기"
        )
      ),
      window.App.renderSection({
        title: "운영 포인트",
        description: "문서에서 확정한 로테이션 소개팅의 핵심 운영 기준입니다.",
        content: e(
          "div",
          { className: "info-grid" },
          ...window.App.text.rotation.highlights.map(function (item) {
            return e(
              "article",
              { key: item, className: "info-card" },
              e("strong", null, item)
            );
          })
        )
      }),
      window.App.renderSection({
        title: "예정 회차",
        description: "현재 신청 가능한 회차를 확인해 보세요.",
        content: e(
          "div",
          { className: "card-grid" },
          ...window.App.text.rotationEvents.map(function (event) {
            return e(window.App.ButtonCard, {
              key: event.id,
              href: window.App.getRoute("rotationApply").path,
              kicker: "모집 중",
              title: event.title,
              description:
                event.location +
                " · " +
                window.App.formatters.formatDateTime(event.eventDate),
              meta:
                "남 " +
                event.maleCapacity +
                "명 / 여 " +
                event.femaleCapacity +
                "명 · 대기열 운영"
            });
          })
        )
      })
    );
  }

  window.App.registerPage("rotation", RotationPage);
})();
