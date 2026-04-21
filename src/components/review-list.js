(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function ReviewList(config) {
    if (!config.reviews.length) {
      return window.App.renderEmptyState("아직 등록된 후기가 없습니다.");
    }

    return e(
      "div",
      { className: "review-list" },
      ...config.reviews.map(function (review) {
        const nickname = review.is_anonymous ? "익명" : review.nickname;
        return e(
          "article",
          { key: review.id, className: "review-card" },
          e(
            "div",
            { className: "review-head" },
            e("strong", null, review.title),
            e(
              "span",
              { className: "review-rating" },
              "★".repeat(Math.max(1, review.rating))
            )
          ),
          e("p", { className: "review-meta" }, nickname + " · " + (review.event_round || "참여 회차 미기재")),
          e("p", { className: "review-body" }, review.content),
          e(
            "p",
            { className: "review-date" },
            window.App.formatters.formatDateTime(review.created_at)
          )
        );
      })
    );
  }

  window.App.ReviewList = ReviewList;
})();
