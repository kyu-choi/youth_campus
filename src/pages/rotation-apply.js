(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function RotationApplyPage() {
    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "로테이션 소개팅 신청"),
        e("h1", { className: "hero-title" }, "회차를 선택하고 참가 정보를 입력해 주세요."),
        e(
          "p",
          { className: "hero-description" },
          "기본 정보, 참가 가능 일정, 참석 가능 여부를 받아 정원과 대기열 상태를 함께 관리합니다."
        )
      ),
      window.App.renderSection({
        title: "신청 폼",
        description: "회차와 참가 정보를 입력하면 접수 후 순차적으로 안내됩니다.",
        content: e(window.App.RotationForm)
      })
    );
  }

  window.App.registerPage("rotationApply", RotationApplyPage);
})();
