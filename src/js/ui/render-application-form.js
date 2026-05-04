window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderApplicationForm =
  function renderApplicationForm(config, mount) {
    if (!mount) {
      return;
    }

    let currentPage = 0;
    const values = {};
    const files = {};

    function matchesCondition(condition) {
      if (!condition) {
        return true;
      }

      return Object.entries(condition).every(([fieldName, expectedValue]) => {
        const currentValue = values[fieldName];
        return Array.isArray(expectedValue)
          ? expectedValue.includes(currentValue)
          : currentValue === expectedValue;
      });
    }

    function getActivePages() {
      return config.pages.filter((page) => matchesCondition(page.showWhen));
    }

    function getAllFieldNames() {
      return config.pages.flatMap((page) =>
        page.fields.map((field) => field.name)
      );
    }

    function getActiveFieldNames() {
      return new Set(
        getActivePages().flatMap((page) =>
          page.fields
            .filter((field) => matchesCondition(field.showWhen))
            .map((field) => field.name)
        )
      );
    }

    function pruneInactiveValues() {
      const activeFieldNames = getActiveFieldNames();

      getAllFieldNames().forEach((fieldName) => {
        if (!activeFieldNames.has(fieldName)) {
          delete values[fieldName];
          delete files[fieldName];
        }
      });
    }

    function getCurrentPage() {
      const activePages = getActivePages();

      if (currentPage >= activePages.length) {
        currentPage = Math.max(activePages.length - 1, 0);
      }

      return activePages[currentPage];
    }

    function getFieldValue(field) {
      if (field.type === "checkbox") {
        return Boolean(values[field.name]);
      }

      if (Array.isArray(values[field.name])) {
        return values[field.name].length > 0;
      }

      return values[field.name] || "";
    }

    function setFieldValue(field, value) {
      values[field.name] = field.type === "checkbox" ? Boolean(value) : value;
    }

    function validatePage() {
      mount
        .querySelectorAll(".application-field.is-invalid")
        .forEach((node) => node.classList.remove("is-invalid"));

      const page = getCurrentPage();
      const missingField = page.fields.find((field) => {
        if (!matchesCondition(field.showWhen)) {
          return false;
        }

        if (!field.required) {
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

      return true;
    }

    function collectVisibleInputs() {
      getCurrentPage().fields.forEach((field) => {
        if (!matchesCondition(field.showWhen)) {
          return;
        }

        const fieldNode = mount.querySelector(`[data-field="${field.name}"]`);

        if (!fieldNode) {
          return;
        }

        if (field.type === "choice") {
          const selected = fieldNode.querySelector("input:checked");
          setFieldValue(field, selected?.value || "");
          return;
        }

        const input = fieldNode.querySelector("input, textarea");

        if (field.type === "file") {
          const selectedFiles = Array.from(input?.files || []);
          if (selectedFiles.length === 0 && getFieldValue(field)) {
            return;
          }

          files[field.name] = selectedFiles;
          setFieldValue(
            field,
            field.multiple
              ? selectedFiles.map((file) => file.name)
              : selectedFiles[0]?.name || ""
          );
          return;
        }

        setFieldValue(
          field,
          field.type === "checkbox" ? input?.checked : input?.value.trim()
        );
      });
    }

    function createField(field) {
      const wrapper = document.createElement("div");
      const label = document.createElement("label");
      const required = field.required ? " *" : "";

      wrapper.className = `application-field application-field-${field.type}`;
      wrapper.dataset.field = field.name;
      label.className = "application-label";
      label.textContent = `${field.label}${required}`;

      if (field.notice) {
        const notice = document.createElement("strong");

        notice.className = "application-field-notice";
        notice.textContent = field.notice;
        wrapper.appendChild(notice);
      }

      if (field.type === "choice") {
        const choices = document.createElement("div");
        choices.className = "choice-grid";

        field.options.forEach((option) => {
          const optionConfig =
            typeof option === "string" ? { value: option, label: option } : option;
          const choice = document.createElement("label");
          const input = document.createElement("input");
          const text = document.createElement("span");

          choice.className = "choice-option";
          input.type = "radio";
          input.name = field.name;
          input.value = optionConfig.value;
          input.checked = values[field.name] === optionConfig.value;
          text.className = "choice-option-text";
          text.textContent = optionConfig.label;

          if (optionConfig.badge) {
            const badge = document.createElement("span");
            badge.className = `choice-option-badge ${
              optionConfig.badgeTone ? `is-${optionConfig.badgeTone}` : ""
            }`.trim();
            badge.textContent = optionConfig.badge;
            text.appendChild(badge);
          }

          choice.append(input, text);
          choices.appendChild(choice);
        });

        wrapper.append(label, choices);
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

      const input =
        field.type === "textarea"
          ? document.createElement("textarea")
          : document.createElement("input");

      if (field.type !== "textarea") {
        input.type = field.type;
      }

      input.name = field.name;
      input.placeholder = field.placeholder || "";
      input.required = Boolean(field.required);

      if (field.type === "file") {
        input.multiple = Boolean(field.multiple);
      } else {
        input.value = values[field.name] || "";
      }

      wrapper.append(label, input);
      return wrapper;
    }

    function renderSuccess() {
      mount.innerHTML = "";

      const homeButton = createHomeButton();
      const success = document.createElement("section");
      const title = document.createElement("h2");
      const message = document.createElement("p");

      success.className = "application-complete";
      title.textContent = config.successTitle;
      message.textContent = config.successMessage;

      success.append(title, message);
      mount.append(homeButton, success);
      mount.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function createHomeButton() {
      const button = document.createElement("button");

      button.className = "home-button";
      button.type = "button";
      button.textContent = "홈";
      button.dataset.homeButton = "";
      button.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("cheongchun:navigate", {
            detail: { target: "#" },
          })
        );
      });

      return button;
    }

    async function submit() {
      collectVisibleInputs();

      if (!validatePage()) {
        return;
      }

      pruneInactiveValues();

      const submitButton = mount.querySelector(".application-next");
      submitButton.disabled = true;
      submitButton.textContent = "제출 중";

      try {
        await window.CheongchunCampus.services.submitApplication(values, files);
        renderSuccess();
      } catch (error) {
        console.error("Application submit failed.", error);
        submitButton.disabled = false;
        submitButton.textContent = config.submitLabel;
        mount.querySelector(".application-error").hidden = false;
      }
    }

    function render() {
      const page = getCurrentPage();
      const activePages = getActivePages();
      const section = document.createElement("section");
      const header = document.createElement("div");
      const eyebrow = document.createElement("p");
      const title = document.createElement("h2");
      const description = document.createElement("p");
      const progress = document.createElement("div");
      const progressBar = document.createElement("span");
      const fields = document.createElement("div");
      const actions = document.createElement("div");
      const back = document.createElement("button");
      const next = document.createElement("button");
      const error = document.createElement("p");
      const homeButton = createHomeButton();
      const isLastPage = currentPage === activePages.length - 1;

      mount.innerHTML = "";
      section.className = "application-card";
      header.className = "application-header";
      eyebrow.className = "application-eyebrow";
      title.className = "application-title";
      description.className = "application-description";
      progress.className = "application-progress";
      progressBar.style.width = `${((currentPage + 1) / activePages.length) * 100}%`;
      fields.className = "application-fields";
      actions.className = "application-actions";
      back.className = "application-back";
      next.className = "application-next";
      error.className = "application-error";
      error.hidden = true;

      eyebrow.textContent = `${page.eyebrow} · ${currentPage + 1}/${activePages.length}`;
      title.textContent = currentPage === 0 ? config.title : page.title;
      description.textContent =
        currentPage === 0 ? `${page.title}\n\n${config.privacyText}` : config.description;
      back.type = "button";
      back.textContent = "이전";
      back.disabled = currentPage === 0;
      next.type = "button";
      next.textContent = isLastPage ? config.submitLabel : "다음";
      error.textContent = "제출 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

      page.fields
        .filter((field) => matchesCondition(field.showWhen))
        .forEach((field) => fields.appendChild(createField(field)));

      back.addEventListener("click", () => {
        collectVisibleInputs();
        currentPage -= 1;
        render();
      });

      next.addEventListener("click", () => {
        collectVisibleInputs();

        if (!validatePage()) {
          return;
        }

        pruneInactiveValues();

        if (isLastPage) {
          submit();
          return;
        }

        currentPage += 1;
        render();
      });

      progress.appendChild(progressBar);
      header.append(eyebrow, title, description, progress);
      actions.append(back, next);
      section.append(header, fields, error, actions);
      mount.append(homeButton, section);
    }

    render();
  };
