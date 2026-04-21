(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function renderHero() {
    const hero = window.App.text.home.hero;

    return e(
      "section",
      { className: "page-hero" },
      e("p", { className: "hero-eyebrow" }, hero.eyebrow),
      e("h1", { className: "hero-title" }, hero.title),
      e("p", { className: "hero-description" }, hero.description),
      e("p", { className: "hero-detail" }, hero.detail)
    );
  }

  function HomePage() {
    return e(
      "div",
      { className: "page-stack" },
      renderHero(),
      window.App.renderSection({
        title: "서비스 바로가기",
        description: "청춘캠퍼스의 핵심 서비스를 한곳에서 확인할 수 있습니다.",
        content: e(
          "div",
          { className: "card-grid" },
          e(window.App.ButtonCard, {
            href: window.App.getRoute("rotation").path,
            kicker: "행사형",
            title: "로테이션 소개팅",
            description:
              "회차별 정원과 대기열을 관리하는 행사형 소개팅 흐름입니다.",
            meta: "소개 페이지 -> 신청 페이지 -> 정원 및 대기열 관리"
          }),
          e(window.App.ButtonCard, {
            href: window.App.getRoute("match").path,
            kicker: "자동매칭형",
            title: "1대1 소개팅",
            description:
              "프로필과 선호 조건을 바탕으로 잘 맞는 상대를 연결하는 소개팅 흐름입니다.",
            meta: "소개 페이지 -> 신청 페이지 -> 매칭 안내"
          }),
          e(window.App.ButtonCard, {
            href: window.App.getRoute("reviews").path,
            kicker: "후기",
            title: "후기",
            description: "이용 후기를 작성하고 공개된 후기를 확인할 수 있습니다.",
            meta: "후기 작성 폼 + 후기 목록"
          }),
          e(window.App.ButtonCard, {
            href: window.App.getRoute("guide").path,
            kicker: "안내",
            title: "이용 안내",
            description: "운영 방식, 개인정보, 매칭 공개 정책을 안내합니다.",
            meta: "운영 원칙 + 신청 전 체크 사항"
          })
        )
      }),
      window.App.renderSection({
        title: "이용 안내",
        description:
          "신청부터 후기 확인까지 필요한 흐름을 한눈에 볼 수 있습니다.",
        content: e(
          "div",
          { className: "info-grid" },
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "신청 절차"),
            e(
              "p",
              null,
              "원하는 소개팅 유형을 선택한 뒤 기본 정보와 선호 조건을 입력해 신청할 수 있습니다."
            )
          ),
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "진행 안내"),
            e(
              "p",
              null,
              "신청 내용 확인 후 일정 및 매칭 결과를 순차적으로 안내드립니다."
            )
          ),
          e(
            "article",
            { className: "info-card" },
            e("strong", null, "이용 후기"),
            e(
              "p",
              null,
              "서비스 이용 후 후기를 남기고 공개된 후기를 함께 확인할 수 있습니다."
            )
          )
        )
      })
    );
  }

  window.App.registerPage("home", HomePage);
})();
