(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function GuidePage() {
    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "신청 전 확인"),
        e("h1", { className: "hero-title" }, "이용 안내"),
        e(
          "p",
          { className: "hero-description" },
          "서비스 운영 원칙, 개인정보 활용 범위, 매칭 공개 정책을 사전에 안내합니다."
        )
      ),
      window.App.renderSection({
        title: "운영 원칙",
        content: e(
          "div",
          { className: "guide-list" },
          ...window.App.text.guide.rules.map(function (rule) {
            return e(
              "article",
              { key: rule, className: "guide-item" },
              e("p", null, rule)
            );
          })
        )
      }),
      window.App.renderSection({
        title: "이용 전 참고 사항",
        description: "신청과 안내 과정에서 알아두면 좋은 내용을 정리했습니다.",
        content: e(
          "div",
          { className: "info-grid" },
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "정보 활용"),
            e("p", null, "입력한 정보는 신청 확인과 매칭 진행을 위해 활용됩니다.")
          ),
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "결과 안내"),
            e("p", null, "신청 순서와 조건에 따라 결과 안내 시점은 달라질 수 있습니다.")
          ),
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "연락 방식"),
            e("p", null, "매칭이 확정되면 등록한 연락처를 통해 순차적으로 안내드립니다.")
          )
        )
      })
    );
  }

  window.App.registerPage("guide", GuidePage);
})();
