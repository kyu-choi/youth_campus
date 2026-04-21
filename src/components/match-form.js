(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useState = React.useState;

  const steps = [
    { id: "basic", label: "1단계 기본 정보" },
    { id: "self", label: "2단계 본인 정보" },
    { id: "preference", label: "3단계 선호 조건" },
    { id: "styleRank", label: "4단계 스타일 우선순위" },
    { id: "consent", label: "5단계 일정 및 동의" }
  ];

  function MatchForm() {
    const [stepIndex, setStepIndex] = useState(0);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(null);
    const [form, setForm] = useState({
      name: "",
      gender: "male",
      age: "",
      university: "",
      grade: "",
      phone: "",
      kakaoId: "",
      region: "",
      height: "",
      selfStyle: "",
      preferredAgeMin: "",
      preferredAgeMax: "",
      preferredHeightMin: "",
      preferredHeightMax: "",
      preferredStyleRank1: "",
      preferredStyleRank2: "",
      preferredStyleRank3: "",
      drinking: "가끔",
      smoking: "비흡연",
      religion: "무교",
      availableSchedule: "",
      intro: "",
      consentPersonalInfo: false
    });

    function updateField(key, value) {
      setForm(function (current) {
        return Object.assign({}, current, { [key]: value });
      });
    }

    function validate() {
      const validationErrors = window.App.validators.collectRequiredErrors([
        { key: "name", value: form.name, message: "이름을 입력해 주세요." },
        { key: "age", value: form.age, message: "나이를 입력해 주세요." },
        { key: "university", value: form.university, message: "학교를 입력해 주세요." },
        { key: "phone", value: form.phone, message: "연락처를 입력해 주세요." },
        { key: "region", value: form.region, message: "지역을 입력해 주세요." },
        { key: "height", value: form.height, message: "키를 입력해 주세요." },
        { key: "selfStyle", value: form.selfStyle, message: "본인 스타일을 선택해 주세요." },
        { key: "preferredAgeMin", value: form.preferredAgeMin, message: "선호 최소 나이를 입력해 주세요." },
        { key: "preferredAgeMax", value: form.preferredAgeMax, message: "선호 최대 나이를 입력해 주세요." },
        { key: "preferredHeightMin", value: form.preferredHeightMin, message: "선호 최소 키를 입력해 주세요." },
        { key: "preferredHeightMax", value: form.preferredHeightMax, message: "선호 최대 키를 입력해 주세요." },
        { key: "preferredStyleRank1", value: form.preferredStyleRank1, message: "1순위 스타일을 선택해 주세요." },
        { key: "preferredStyleRank2", value: form.preferredStyleRank2, message: "2순위 스타일을 선택해 주세요." },
        { key: "preferredStyleRank3", value: form.preferredStyleRank3, message: "3순위 스타일을 선택해 주세요." },
        { key: "intro", value: form.intro, message: "자기소개를 입력해 주세요." }
      ]);

      if (!window.App.validators.isPhoneNumber(form.phone)) {
        validationErrors.phone = "휴대폰 번호 형식으로 입력해 주세요.";
      }

      [
        "age",
        "height",
        "preferredAgeMin",
        "preferredAgeMax",
        "preferredHeightMin",
        "preferredHeightMax"
      ].forEach(function (key) {
        if (!window.App.validators.isPositiveNumber(form[key])) {
          validationErrors[key] = "숫자로 입력해 주세요.";
        }
      });

      if (
        !window.App.validators.isRangeValid(form.preferredAgeMin, form.preferredAgeMax)
      ) {
        validationErrors.preferredAgeMax = "선호 나이 범위를 다시 확인해 주세요.";
      }

      if (
        !window.App.validators.isRangeValid(
          form.preferredHeightMin,
          form.preferredHeightMax
        )
      ) {
        validationErrors.preferredHeightMax = "선호 키 범위를 다시 확인해 주세요.";
      }

      if (
        window.App.validators.hasDuplicateValues([
          form.preferredStyleRank1,
          form.preferredStyleRank2,
          form.preferredStyleRank3
        ])
      ) {
        validationErrors.preferredStyleRank2 = "선호 스타일은 중복 없이 선택해 주세요.";
        validationErrors.preferredStyleRank3 = "선호 스타일은 중복 없이 선택해 주세요.";
      }

      if (!form.consentPersonalInfo) {
        validationErrors.consentPersonalInfo = "개인정보 동의가 필요합니다.";
      }

      return validationErrors;
    }

    function goNext() {
      setStepIndex(function (current) {
        return Math.min(steps.length - 1, current + 1);
      });
    }

    function goPrev() {
      setStepIndex(function (current) {
        return Math.max(0, current - 1);
      });
    }

    function handleSubmit(event) {
      event.preventDefault();
      const validationErrors = validate();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const result = window.App.matchingService.submitMatchApplication(form);
      setErrors({});
      setSubmitted(result);
    }

    function renderInput(label, key, type, placeholder) {
      return e(
        "label",
        { className: "field-block", key: key },
        e("span", { className: "field-label" }, label),
        e("input", {
          className: "text-input",
          type: type,
          value: form[key],
          placeholder: placeholder || "",
          onChange: function (event) {
            updateField(key, event.target.value);
          }
        }),
        errors[key] ? e("span", { className: "field-error" }, errors[key]) : null
      );
    }

    function renderSelect(label, key, options, includeEmpty) {
      return e(
        "label",
        { className: "field-block", key: key },
        e("span", { className: "field-label" }, label),
        e(
          "select",
          {
            className: "text-input",
            value: form[key],
            onChange: function (event) {
              updateField(key, event.target.value);
            }
          },
          includeEmpty ? e("option", { value: "" }, "선택") : null,
          ...options.map(function (option) {
            const value = typeof option === "string" ? option : option.value;
            const labelText = typeof option === "string" ? option : option.label;
            return e("option", { key: value, value: value }, labelText);
          })
        ),
        errors[key] ? e("span", { className: "field-error" }, errors[key]) : null
      );
    }

    function renderStepContent() {
      if (stepIndex === 0) {
        return e(
          "div",
          { className: "form-grid two-column" },
          renderInput("이름", "name", "text", "홍길동"),
          renderSelect("성별", "gender", window.App.text.formOptions.genders),
          renderInput("나이", "age", "number", "24"),
          renderInput("학교", "university", "text", "청춘대학교"),
          renderSelect("학년", "grade", window.App.text.formOptions.grades, true),
          renderInput("연락처", "phone", "tel", "01012345678"),
          renderInput("카카오톡 ID", "kakaoId", "text", "youthcampus"),
          renderInput("지역", "region", "text", "신촌")
        );
      }

      if (stepIndex === 1) {
        return e(
          "div",
          { className: "form-grid two-column" },
          renderInput("키(cm)", "height", "number", "175"),
          renderSelect("본인 스타일", "selfStyle", window.App.text.formOptions.styles, true),
          renderSelect("음주 여부", "drinking", window.App.text.formOptions.drinking),
          renderSelect("흡연 여부", "smoking", window.App.text.formOptions.smoking),
          renderSelect("종교", "religion", window.App.text.formOptions.religion),
          e(
            "label",
            { className: "field-block full-span" },
            e("span", { className: "field-label" }, "자기소개"),
            e("textarea", {
              className: "text-area",
              rows: 5,
              value: form.intro,
              placeholder: "대화 스타일, 관심사, 만나고 싶은 사람을 자유롭게 적어 주세요.",
              onChange: function (event) {
                updateField("intro", event.target.value);
              }
            }),
            errors.intro ? e("span", { className: "field-error" }, errors.intro) : null
          )
        );
      }

      if (stepIndex === 2) {
        return e(
          "div",
          { className: "form-grid two-column" },
          renderInput("선호 최소 나이", "preferredAgeMin", "number", "22"),
          renderInput("선호 최대 나이", "preferredAgeMax", "number", "27"),
          renderInput("선호 최소 키", "preferredHeightMin", "number", "165"),
          renderInput("선호 최대 키", "preferredHeightMax", "number", "185")
        );
      }

      if (stepIndex === 3) {
        return e(
          "div",
          { className: "form-grid" },
          renderSelect(
            "선호 스타일 1순위",
            "preferredStyleRank1",
            window.App.text.formOptions.styles,
            true
          ),
          renderSelect(
            "선호 스타일 2순위",
            "preferredStyleRank2",
            window.App.text.formOptions.styles,
            true
          ),
          renderSelect(
            "선호 스타일 3순위",
            "preferredStyleRank3",
            window.App.text.formOptions.styles,
            true
          )
        );
      }

      return e(
        "div",
        { className: "form-grid" },
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "가능한 일정"),
          e("textarea", {
            className: "text-area",
            rows: 4,
            value: form.availableSchedule,
            placeholder: "예: 평일 저녁, 토요일 오후 가능",
            onChange: function (event) {
              updateField("availableSchedule", event.target.value);
            }
          })
        ),
        e(
          "label",
          { className: "checkbox-row" },
          e("input", {
            type: "checkbox",
            checked: form.consentPersonalInfo,
            onChange: function (event) {
              updateField("consentPersonalInfo", event.target.checked);
            }
          }),
          e("span", null, "개인정보 수집 및 운영 목적 활용에 동의합니다.")
        ),
        errors.consentPersonalInfo
          ? e("span", { className: "field-error" }, errors.consentPersonalInfo)
          : null
      );
    }

    return e(
      "div",
      { className: "form-shell" },
      submitted
        ? e(
            "div",
            { className: "success-card" },
            e("p", { className: "success-badge" }, "신청 완료"),
            e("h3", null, submitted.profile.name + "님의 신청이 저장되었습니다."),
            e(
              "p",
              null,
              "입력한 스타일 우선순위와 선호 조건을 바탕으로 어울리는 상대를 순차적으로 연결해 드립니다."
            ),
            e(
              "p",
              { className: "success-note" },
              "진행 상황과 결과는 등록한 연락처로 안내드립니다."
            )
          )
        : null,
      e(
        "div",
        { className: "stepper is-five" },
        ...steps.map(function (step, index) {
          const className = index === stepIndex ? "step is-active" : "step";
          return e(
            "div",
            { key: step.id, className: className },
            e("span", { className: "step-index" }, index + 1),
            e("span", { className: "step-label" }, step.label)
          );
        })
      ),
      e(
        "form",
        { className: "stack-form", onSubmit: handleSubmit },
        renderStepContent(),
        e(
          "div",
          { className: "form-actions" },
          stepIndex > 0
            ? e(
                "button",
                {
                  className: "secondary-button",
                  type: "button",
                  onClick: goPrev
                },
                "이전"
              )
            : e("span", null),
          stepIndex < steps.length - 1
            ? e(
                "button",
                {
                  className: "primary-button",
                  type: "button",
                  onClick: goNext
                },
                "다음"
              )
            : e("button", { className: "primary-button", type: "submit" }, "신청 저장")
        )
      )
    );
  }

  window.App.MatchForm = MatchForm;
})();
