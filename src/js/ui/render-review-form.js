window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderReviewForm =
  function renderReviewForm(config, mount) {
    if (!mount) {
      return;
    }

    const values = {};
    const dynamicOptions = {};

    function matchesCondition(condition) {
      if (!condition) {
        return true;
      }

      return Object.entries(condition).every(
        ([fieldName, expectedValue]) => values[fieldName] === expectedValue
      );
    }

    function getOpponentOptions() {
      const maxNumber = 12;
      const gender = values.participant_gender;
      const prefix =
        gender === "남성" ? "여자" : gender === "여성" ? "남자" : "참가자";

      return Array.from({ length: maxNumber }, (_, index) => {
        const number = index + 1;
        return prefix === "참가자"
          ? [`남자 ${number}번`, `여자 ${number}번`]
          : [`${prefix} ${number}번`];
      }).flat();
    }

    function getFieldValue(field) {
      if (field.type === "checkbox") {
        return Boolean(values[field.name]);
      }

      return values[field.name] || "";
    }

    function setFieldValue(field, value) {
      values[field.name] = field.type === "checkbox" ? Boolean(value) : value;
    }

    function collectInputs() {
      config.fields.forEach((field) => {
        const node = mount.querySelector(`[data-field="${field.name}"]`);

        if (!node) {
          delete values[field.name];
          return;
        }

        if (field.type === "choice") {
          setFieldValue(field, node.querySelector("input:checked")?.value || "");
          return;
        }

        if (field.type === "checkbox") {
          setFieldValue(field, node.querySelector("input")?.checked);
          return;
        }

        setFieldValue(field, node.querySelector("input, select, textarea")?.value.trim() || "");
      });
    }

    function validate() {
      mount
        .querySelectorAll(".application-field.is-invalid")
        .forEach((node) => node.classList.remove("is-invalid"));

      const missingField = config.fields.find((field) => {
        if (!matchesCondition(field.showWhen) || !field.required) {
          return false;
        }

        return !getFieldValue(field);
      });

      if (missingField) {
        const target = mount.querySelector(`[data-field="${missingField.name}"]`);
        target?.classList.add("is-invalid");
        target?.scrollIntoView({ block: "center", behavior: "smooth" });
        return false;
      }

      if (values.phone_last4 && !/^\d{4}$/.test(values.phone_last4)) {
        const target = mount.querySelector('[data-field="phone_last4"]');
        target?.classList.add("is-invalid");
        target?.scrollIntoView({ block: "center", behavior: "smooth" });
        return false;
      }

      return true;
    }

    function createChoice(field) {
      const choices = document.createElement("div");
      choices.className = "choice-grid";

      field.options.forEach((option) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        label.className = "choice-option";
        input.type = "radio";
        input.name = field.name;
        input.value = option;
        input.checked = values[field.name] === option;
        input.addEventListener("change", () => {
          collectInputs();
          render();
        });
        text.className = "choice-option-text";
        text.textContent = option;
        label.append(input, text);
        choices.appendChild(label);
      });

      return choices;
    }

    function createSelect(field) {
      const select = document.createElement("select");
      const options =
        field.type === "participant-select"
          ? getOpponentOptions()
          : dynamicOptions[field.name] || field.options;

      select.name = field.name;
      select.appendChild(new Option(field.emptyLabel || "선택 안 함", ""));
      options.forEach((option) => select.appendChild(new Option(option, option)));
      select.value = values[field.name] || "";

      return select;
    }

    function createField(field) {
      const wrapper = document.createElement("div");
      const label = document.createElement("label");

      wrapper.className = `application-field application-field-${field.type}`;
      wrapper.dataset.field = field.name;
      label.className = "application-label";
      label.textContent = `${field.label}${field.required ? " *" : ""}`;

      if (field.type === "choice") {
        wrapper.append(label, createChoice(field));
        return wrapper;
      }

      if (field.type === "checkbox") {
        const checkbox = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        checkbox.className = "consent-option";
        input.type = "checkbox";
        input.name = field.name;
        input.checked = Boolean(values[field.name]);
        text.textContent = field.label;
        checkbox.append(input, text);
        wrapper.append(checkbox);
        return wrapper;
      }

      if (field.type === "select" || field.type === "participant-select") {
        wrapper.append(label, createSelect(field));
        return wrapper;
      }

      const input =
        field.type === "textarea"
          ? document.createElement("textarea")
          : document.createElement("input");

      input.name = field.name;
      input.placeholder = field.placeholder || "";
      input.value = values[field.name] || "";

      if (field.type !== "textarea") {
        input.type = field.type;
      }

      if (field.inputMode) {
        input.inputMode = field.inputMode;
      }

      if (field.maxLength) {
        input.maxLength = field.maxLength;
      }

      wrapper.append(label, input);
      return wrapper;
    }

    function createLinkButton(href, text, className) {
      const link = document.createElement("a");

      link.className = className;
      link.href = href;
      link.textContent = text;
      return link;
    }

    function renderSuccess() {
      const section = document.createElement("section");
      const title = document.createElement("h2");
      const message = document.createElement("p");
      const actions = document.createElement("div");

      mount.innerHTML = "";
      section.className = "application-complete review-complete";
      title.textContent = config.successTitle;
      message.textContent = config.successMessage;
      actions.className = "review-complete-actions";
      actions.append(
        createLinkButton(config.kakaoUrl, "카카오톡 채널로 이동하기", "application-next review-link-button"),
        createLinkButton("index.html", "메인 페이지로 돌아가기", "application-back review-link-button")
      );
      section.append(title, message, actions);
      mount.appendChild(section);
      mount.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function renderLoading() {
      const section = document.createElement("section");
      const title = document.createElement("h1");
      const description = document.createElement("p");

      mount.innerHTML = "";
      section.className = "application-card review-card";
      title.className = "application-title";
      description.className = "application-description";
      title.textContent = config.title;
      description.textContent = "참여 날짜를 불러오는 중입니다.";
      section.append(title, description);
      mount.appendChild(section);
    }

    async function submit() {
      collectInputs();

      if (!validate()) {
        return;
      }

      const submitButton = mount.querySelector(".application-next");
      submitButton.disabled = true;
      submitButton.textContent = "제출 중";

      try {
        await window.CheongchunCampus.services.submitReview(values);
        renderSuccess();
      } catch (error) {
        console.error("Review submit failed.", error);
        submitButton.disabled = false;
        submitButton.textContent = config.submitLabel;
        mount.querySelector(".application-error").hidden = false;
      }
    }

    function render() {
      const section = document.createElement("section");
      const header = document.createElement("div");
      const title = document.createElement("h1");
      const description = document.createElement("p");
      const notice = document.createElement("p");
      const fields = document.createElement("div");
      const error = document.createElement("p");
      const actions = document.createElement("div");
      const submitButton = document.createElement("button");

      mount.innerHTML = "";
      section.className = "application-card review-card";
      header.className = "application-header";
      title.className = "application-title";
      description.className = "application-description";
      notice.className = "review-notice";
      fields.className = "application-fields";
      error.className = "application-error";
      actions.className = "application-actions";
      submitButton.className = "application-next";
      submitButton.type = "button";
      error.hidden = true;

      title.textContent = config.title;
      description.textContent = config.description;
      notice.textContent =
        "작성해주신 내용은 운영 및 매칭 확인 목적으로만 사용되며, 개별 후기 내용과 일방 선택 정보는 상대방에게 공개되지 않습니다.";
      error.textContent = "제출 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      submitButton.textContent = config.submitLabel;

      config.fields
        .filter((field) => matchesCondition(field.showWhen))
        .forEach((field) => fields.appendChild(createField(field)));

      submitButton.addEventListener("click", submit);
      actions.appendChild(submitButton);
      header.append(title, description, notice);
      section.append(header, fields, error, actions);
      mount.appendChild(section);
    }

    async function initialize() {
      const eventDateField = config.fields.find(
        (field) => field.dynamicOptions === "applicationPreferredDates"
      );

      if (!eventDateField) {
        render();
        return;
      }

      renderLoading();

      try {
        const dates =
          await window.CheongchunCampus.services.getReviewEventDates();
        dynamicOptions[eventDateField.name] = dates;

        if (dates.length === 0) {
          eventDateField.emptyLabel = "선택 가능한 날짜가 없습니다.";
        }
      } catch (error) {
        console.error("Review event dates load failed.", error);
        dynamicOptions[eventDateField.name] = [];
        eventDateField.emptyLabel = "날짜를 불러오지 못했습니다.";
      }

      render();
    }

    initialize();
  };
