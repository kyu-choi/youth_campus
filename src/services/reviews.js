(function () {
  window.App = window.App || {};

  function submitReview(form) {
    const normalize = window.App.validators.normalize;
    const timestamp = window.App.profilesService.nowIso();
    const record = {
      id: window.App.storeService.createId("review"),
      profile_id: "",
      nickname: normalize(form.nickname),
      title: normalize(form.title),
      content: normalize(form.content),
      rating: Number(form.rating),
      event_round: normalize(form.eventRound),
      is_anonymous: Boolean(form.isAnonymous),
      is_approved: true,
      created_at: timestamp,
      updated_at: timestamp
    };

    window.App.storeService.mutateStore(function (store) {
      store.reviews.unshift(record);
      return store;
    });

    return record;
  }

  function listReviews() {
    return window.App.storeService
      .readStore()
      .reviews.slice()
      .sort(function (left, right) {
        return new Date(right.created_at) - new Date(left.created_at);
      });
  }

  window.App.reviewsService = {
    submitReview: submitReview,
    listReviews: listReviews
  };
})();
