(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useState = React.useState;

  function ReviewsPage() {
    const [reviews, setReviews] = useState(window.App.reviewsService.listReviews());

    function refreshReviews() {
      setReviews(window.App.reviewsService.listReviews());
    }

    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "후기"),
        e("h1", { className: "hero-title" }, "이용 후기를 남기고 공개된 후기를 확인하세요."),
        e("p", { className: "hero-description" }, window.App.text.reviews.notice)
      ),
      e(
        "div",
        { className: "content-columns" },
        window.App.renderSection({
          title: "후기 작성",
          content: e(window.App.ReviewForm, { onSubmitted: refreshReviews })
        }),
        window.App.renderSection({
          title: "후기 목록",
          description: "최신순으로 정렬됩니다.",
          content: e(window.App.ReviewList, { reviews: reviews })
        })
      )
    );
  }

  window.App.registerPage("reviews", ReviewsPage);
})();
