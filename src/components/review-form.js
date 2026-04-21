(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useState = React.useState;

  function ReviewForm(config) {
    const [form, setForm] = useState({
      nickname: "",
      title: "",
      content: "",
      rating: "5",
      eventRound: "",
      isAnonymous: false
    });
    const [errors, setErrors] = useState({});

    function updateField(key, value) {
      setForm(function (current) {
        return Object.assign({}, current, { [key]: value });
      });
    }

    function handleSubmit(event) {
      event.preventDefault();
      const validationErrors = window.App.validators.collectRequiredErrors([
        { key: "nickname", value: form.nickname, message: "닉네임을 입력해 주세요." },
        { key: "title", value: form.title, message: "제목을 입력해 주세요." },
        { key: "content", value: form.content, message: "후기 내용을 입력해 주세요." }
      ]);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const result = window.App.reviewsService.submitReview(form);
      setErrors({});
      setForm({
        nickname: "",
        title: "",
        content: "",
        rating: "5",
        eventRound: "",
        isAnonymous: false
      });

      if (config.onSubmitted) {
        config.onSubmitted(result);
      }
    }

    return e(
      "form",
      { className: "stack-form", onSubmit: handleSubmit },
      e(
        "label",
        { className: "field-block" },
        e("span", { className: "field-label" }, "닉네임"),
        e("input", {
          className: "text-input",
          value: form.nickname,
          onChange: function (event) {
            updateField("nickname", event.target.value);
          }
        }),
        errors.nickname ? e("span", { className: "field-error" }, errors.nickname) : null
      ),
      e(
        "label",
        { className: "field-block" },
        e("span", { className: "field-label" }, "후기 제목"),
        e("input", {
          className: "text-input",
          value: form.title,
          onChange: function (event) {
            updateField("title", event.target.value);
          }
        }),
        errors.title ? e("span", { className: "field-error" }, errors.title) : null
      ),
      e(
        "label",
        { className: "field-block" },
        e("span", { className: "field-label" }, "후기 내용"),
        e("textarea", {
          className: "text-area",
          rows: 5,
          value: form.content,
          onChange: function (event) {
            updateField("content", event.target.value);
          }
        }),
        errors.content ? e("span", { className: "field-error" }, errors.content) : null
      ),
      e(
        "div",
        { className: "form-grid two-column" },
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "별점"),
          e(
            "select",
            {
              className: "text-input",
              value: form.rating,
              onChange: function (event) {
                updateField("rating", event.target.value);
              }
            },
            [5, 4, 3, 2, 1].map(function (score) {
              return e("option", { key: score, value: String(score) }, score + "점");
            })
          )
        ),
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "참여 회차 또는 날짜"),
          e("input", {
            className: "text-input",
            value: form.eventRound,
            placeholder: "예: 5월 1회차",
            onChange: function (event) {
              updateField("eventRound", event.target.value);
            }
          })
        )
      ),
      e(
        "label",
        { className: "checkbox-row" },
        e("input", {
          type: "checkbox",
          checked: form.isAnonymous,
          onChange: function (event) {
            updateField("isAnonymous", event.target.checked);
          }
        }),
        e("span", null, "익명으로 표시하기")
      ),
      e("button", { className: "primary-button", type: "submit" }, "후기 등록")
    );
  }

  window.App.ReviewForm = ReviewForm;
})();
