(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useState = React.useState;

  function RotationForm() {
    const [form, setForm] = useState({
      name: "",
      gender: "male",
      age: "",
      university: "",
      grade: "",
      phone: "",
      kakaoId: "",
      region: "",
      rotationEventId: window.App.text.rotationEvents[0].id,
      availableSchedule: "",
      attendanceStatus: "참석 가능",
      shortIntro: "",
      consentPersonalInfo: false
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(null);

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
        { key: "region", value: form.region, message: "지역을 입력해 주세요." }
      ]);

      if (!window.App.validators.isPhoneNumber(form.phone)) {
        validationErrors.phone = "휴대폰 번호 형식으로 입력해 주세요.";
      }

      if (!window.App.validators.isPositiveNumber(form.age)) {
        validationErrors.age = "나이는 숫자로 입력해 주세요.";
      }

      if (!form.consentPersonalInfo) {
        validationErrors.consentPersonalInfo = "개인정보 동의가 필요합니다.";
      }

      return validationErrors;
    }

    function handleSubmit(event) {
      event.preventDefault();
      const validationErrors = validate();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const result = window.App.rotationService.submitRotationApplication(form);
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

    return e(
      "div",
      { className: "form-shell" },
      submitted
        ? e(
            "div",
            { className: "success-card" },
            e("p", { className: "success-badge" }, "신청 완료"),
            e("h3", null, submitted.event.title),
            e(
              "p",
              null,
              submitted.application.application_status === "confirmed"
                ? "정원 내 신청으로 접수되었습니다."
                : submitted.application.application_status === "waitlisted"
                  ? "대기열로 접수되었습니다."
                  : "회차 마감 상태로 기록되었습니다."
            ),
            e(
              "p",
              { className: "success-note" },
              "참가 여부와 상세 안내는 등록한 연락처로 순차적으로 전달됩니다."
            )
          )
        : null,
      e(
        "form",
        { className: "stack-form", onSubmit: handleSubmit },
        e(
          "div",
          { className: "form-grid two-column" },
          renderInput("이름", "name", "text", "홍길동"),
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "성별"),
            e(
              "select",
              {
                className: "text-input",
                value: form.gender,
                onChange: function (event) {
                  updateField("gender", event.target.value);
                }
              },
              ...window.App.text.formOptions.genders.map(function (option) {
                return e("option", { key: option.value, value: option.value }, option.label);
              })
            )
          ),
          renderInput("나이", "age", "number", "24"),
          renderInput("학교", "university", "text", "청춘대학교"),
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "학년"),
            e(
              "select",
              {
                className: "text-input",
                value: form.grade,
                onChange: function (event) {
                  updateField("grade", event.target.value);
                }
              },
              e("option", { value: "" }, "선택"),
              ...window.App.text.formOptions.grades.map(function (grade) {
                return e("option", { key: grade, value: grade }, grade);
              })
            )
          ),
          renderInput("연락처", "phone", "tel", "01012345678"),
          renderInput("카카오톡 ID", "kakaoId", "text", "youthcampus"),
          renderInput("지역", "region", "text", "신촌")
        ),
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "참가 회차"),
          e(
            "select",
            {
              className: "text-input",
              value: form.rotationEventId,
              onChange: function (event) {
                updateField("rotationEventId", event.target.value);
              }
            },
            ...window.App.text.rotationEvents.map(function (item) {
              return e("option", { key: item.id, value: item.id }, item.title);
            })
          )
        ),
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "참가 가능 일정"),
          e("textarea", {
            className: "text-area",
            rows: 3,
            value: form.availableSchedule,
            placeholder: "예: 금요일 저녁, 토요일 오후 가능",
            onChange: function (event) {
              updateField("availableSchedule", event.target.value);
            }
          })
        ),
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "참석 가능 여부"),
          e(
            "select",
            {
              className: "text-input",
              value: form.attendanceStatus,
              onChange: function (event) {
                updateField("attendanceStatus", event.target.value);
              }
            },
            e("option", { value: "참석 가능" }, "참석 가능"),
            e("option", { value: "조율 필요" }, "조율 필요")
          )
        ),
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "간단 소개"),
          e("textarea", {
            className: "text-area",
            rows: 4,
            value: form.shortIntro,
            placeholder: "행사에서 기대하는 분위기를 적어 주세요.",
            onChange: function (event) {
              updateField("shortIntro", event.target.value);
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
          : null,
        e("button", { className: "primary-button", type: "submit" }, "신청 저장")
      )
    );
  }

  window.App.RotationForm = RotationForm;
})();
