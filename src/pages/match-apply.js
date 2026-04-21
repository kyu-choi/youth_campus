(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function MatchApplyPage() {
    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "1대1 소개팅 신청"),
        e("h1", { className: "hero-title" }, "기본 정보와 선호 조건을 단계별로 입력해 주세요."),
        e(
          "p",
          { className: "hero-description" },
          "입력해 주신 정보와 스타일 우선순위는 더 잘 맞는 상대를 연결하는 데 활용됩니다."
        )
      ),
      window.App.renderSection({
        title: "신청 폼",
        description: "기본 정보, 본인 스타일, 선호 조건, 선호 스타일 순위를 순서대로 작성해 주세요.",
        content: e(window.App.MatchForm)
      })
    );
  }

  window.App.registerPage("matchApply", MatchApplyPage);
})();
