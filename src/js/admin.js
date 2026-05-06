window.CheongchunCampus = window.CheongchunCampus || {};

(function setupAdminPage() {
  const client = window.CheongchunCampus.services.getSupabaseClient();

  const state = {
    rows: [],
    filteredRows: [],
    selectedRow: null,
    sortKey: "submitted_at",
    sortDirection: "desc",
    mobileProgramType: "",
    mobileDate: "",
  };

  const elements = {
    loginPanel: document.getElementById("login-panel"),
    adminPanel: document.getElementById("admin-panel"),
    loginForm: document.getElementById("login-form"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    loginMessage: document.getElementById("login-message"),
    logoutButton: document.getElementById("logout-button"),
    adminEmail: document.getElementById("admin-email"),
    totalCount: document.getElementById("total-count"),
    maleCount: document.getElementById("male-count"),
    femaleCount: document.getElementById("female-count"),
    paidCount: document.getElementById("paid-count"),
    unpaidCount: document.getElementById("unpaid-count"),
    candidateCount: document.getElementById("candidate-count"),
    matchedCount: document.getElementById("matched-count"),
    tableCaption: document.getElementById("table-caption"),
    searchInput: document.getElementById("search-input"),
    dateFilter: document.getElementById("date-filter"),
    programFilter: document.getElementById("program-filter"),
    genderFilter: document.getElementById("gender-filter"),
    paymentFilter: document.getElementById("payment-filter"),
    matchingFilter: document.getElementById("matching-filter"),
    refreshButton: document.getElementById("refresh-button"),
    tableBody: document.getElementById("response-table-body"),
    mobileProgramButtons: document.querySelectorAll("[data-mobile-program]"),
    mobileDateChoices: document.getElementById("mobile-date-choices"),
    mobileFlowHint: document.getElementById("mobile-flow-hint"),
    mobileList: document.getElementById("mobile-response-list"),
    emptyDetail: document.getElementById("empty-detail"),
    detailContent: document.getElementById("detail-content"),
    reviewForm: document.getElementById("review-form"),
    paymentStatus: document.getElementById("payment-status"),
    matchingStatusField: document.getElementById("matching-status-field"),
    matchingStatus: document.getElementById("matching-status"),
    reviewMessage: document.getElementById("review-message"),
    responseSummary: document.getElementById("response-summary"),
    drinkSummary: document.getElementById("drink-summary"),
  };

  if (!client) {
    setMessage(elements.loginMessage, "Supabase 설정을 확인해주세요.", true);
    return;
  }

  function setMessage(target, message, isError = false) {
    target.textContent = message;
    target.classList.toggle("is-error", isError);
  }

  function formatDateTime(value) {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getPaymentLabel(status) {
    return (
      {
        unpaid: "미입금",
        deposit_paid: "예약금",
        paid: "입금완료",
        refunded: "환불",
        waived: "면제",
      }[status] || status || "미입금"
    );
  }

  function getMatchingLabel(status) {
    return (
      {
        unmatched: "미매칭",
        candidate: "후보",
        matched: "매칭완료",
        notified: "안내완료",
        cancelled: "취소",
      }[status] || status || "미매칭"
    );
  }

  function getProgramLabel(programType) {
    return (
      {
        "다대다 로테이션 소개팅": "로테이션",
        "1:1 카톡 소개팅": "1대1 카카오톡",
      }[programType] ||
      programType ||
      "-"
    );
  }

  function getMobileProgramLabel(programType) {
    return (
      {
        "다대다 로테이션 소개팅": "로테이션",
        "1:1 카톡 소개팅": "1대1",
      }[programType] ||
      getProgramLabel(programType)
    );
  }

  function getMobileGenderLabel(gender) {
    return (
      {
        남성: "남",
        여성: "여",
      }[gender] ||
      gender ||
      "-"
    );
  }

  function isOneToOne(row) {
    return row.program_type === "1:1 카톡 소개팅";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showLogin() {
    elements.loginPanel.hidden = false;
    elements.adminPanel.hidden = true;
    elements.logoutButton.hidden = true;
    elements.adminEmail.textContent = "";
  }

  function showAdmin(email) {
    elements.loginPanel.hidden = true;
    elements.adminPanel.hidden = false;
    elements.logoutButton.hidden = false;
    elements.adminEmail.textContent = email;
  }

  async function requireAdmin() {
    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      showLogin();
      return false;
    }

    const { data, error } = await client.rpc("is_application_admin");
    if (error || data !== true) {
      await client.auth.signOut();
      showLogin();
      setMessage(
        elements.loginMessage,
        "관리자 권한이 없습니다. admin_users 테이블에 이메일을 등록해주세요.",
        true
      );
      return false;
    }

    showAdmin(session.user.email);
    return true;
  }

  async function loadData() {
    setMessage(elements.reviewMessage, "신청자 정보를 불러오는 중입니다.");

    const responses = await client
      .from("application_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (responses.error) {
      setMessage(elements.reviewMessage, responses.error.message, true);
      return;
    }

    state.rows = (responses.data || []).map(normalizeSubmission);
    renderDateOptions();
    applyFilters();
    renderSummary();
    setMessage(elements.reviewMessage, "");
  }

  function normalizeSubmission(row) {
    const payload = row.payload || {};
    const uploadedFiles = payload.uploaded_files || {};
    const phone = row.phone || row.applicant_phone || payload.phone || "";
    const birthYear = row.birth_year ? Number(row.birth_year) : null;

    return {
      ...row,
      submitted_at: row.created_at,
      name: row.name || row.applicant_name || payload.name || "",
      phone,
      kakao_id: row.kakao_id || payload.kakao_id || "",
      gender: row.gender || payload.gender || "",
      birth_year: birthYear,
      age: birthYear ? new Date().getFullYear() - birthYear + 1 : "",
      region: row.region || payload.region || "",
      program_type: row.program_type || payload.program_type || "",
      preferred_date: row.preferred_date || payload.preferred_date || "",
      companion_name: row.companion_name || payload.companion_name || "",
      school: row.school || payload.school || "",
      major: row.major || payload.major || "",
      residence: row.residence || payload.residence || "",
      job: row.job || payload.job || "",
      height_cm: row.height || payload.height || "",
      weight_kg: row.weight || payload.weight || "",
      smoking: row.smoking || payload.smoking || "",
      preferred_age: row.preferred_age || payload.preferred_age || "",
      avoided_age: row.avoided_age || payload.avoided_age || "",
      avoided_person: row.avoided_person || payload.avoided_person || "",
      ideal_type: row.ideal_type || payload.ideal_type || "",
      self_intro: row.self_intro || payload.self_intro || "",
      drink: row.drink || payload.drink || "",
      drink_temperature: row.drink_temperature || payload.drink_temperature || "",
      student_file:
        row.employment_files ||
        uploadedFiles.employment_file_names ||
        [],
      profile_photos:
        row.profile_photos ||
        uploadedFiles.profile_photo_names ||
        [],
      payment_status: row.payment_status || "unpaid",
      matching_status:
        row.program_type === "1:1 카톡 소개팅"
          ? row.matching_status || "unmatched"
          : "",
    };
  }

  function renderDateOptions() {
    const currentValue = elements.dateFilter.value;
    const dates = Array.from(
      new Set(state.rows.map((row) => row.preferred_date).filter(Boolean))
    );

    elements.dateFilter.innerHTML = '<option value="">전체 일정</option>';
    dates.forEach((date) => {
      const option = document.createElement("option");
      option.value = date;
      option.textContent = date;
      elements.dateFilter.appendChild(option);
    });

    elements.dateFilter.value = dates.includes(currentValue) ? currentValue : "";
  }

  function applyFilters() {
    const keyword = elements.searchInput.value.trim().toLowerCase();
    const date = elements.dateFilter.value;
    const program = elements.programFilter.value;
    const gender = elements.genderFilter.value;
    const paymentStatus = elements.paymentFilter.value;
    const matchingStatus = elements.matchingFilter.value;

    state.filteredRows = state.rows.filter((row) => {
      const haystack = [
        row.name,
        row.phone,
        row.kakao_id,
        row.school,
        row.major,
        row.residence,
        row.program_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!keyword || haystack.includes(keyword)) &&
        (!date || row.preferred_date === date) &&
        (!program || row.program_type === program) &&
        (!gender || row.gender === gender) &&
        (!paymentStatus || (row.payment_status || "unpaid") === paymentStatus) &&
        (!matchingStatus ||
          (isOneToOne(row) &&
            (row.matching_status || "unmatched") === matchingStatus))
      );
    });

    sortRows();
    syncMobileSelection();
    renderCounters();
    renderTable();
  }

  function syncMobileSelection() {
    if (
      state.mobileProgramType === "다대다 로테이션 소개팅" &&
      state.mobileDate &&
      !getMobileRotationDates().includes(state.mobileDate)
    ) {
      state.mobileDate = "";
    }
  }

  function sortRows() {
    const direction = state.sortDirection === "asc" ? 1 : -1;
    const key = state.sortKey;

    state.filteredRows.sort((a, b) => {
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";
      const fallbackBySubmittedAt =
        new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);

      if (key === "age" || key === "score") {
        return (
          (Number(aValue) - Number(bValue)) * direction ||
          fallbackBySubmittedAt
        );
      }

      if (key === "submitted_at") {
        return (new Date(aValue) - new Date(bValue)) * direction;
      }

      return (
        String(aValue).localeCompare(String(bValue), "ko") * direction ||
        fallbackBySubmittedAt
      );
    });
  }

  function renderCounters() {
    elements.totalCount.textContent = String(state.filteredRows.length);
    elements.maleCount.textContent = String(
      state.filteredRows.filter((row) => row.gender === "남성").length
    );
    elements.femaleCount.textContent = String(
      state.filteredRows.filter((row) => row.gender === "여성").length
    );
    elements.paidCount.textContent = String(
      state.filteredRows.filter((row) =>
        ["deposit_paid", "paid", "waived"].includes(row.payment_status || "unpaid")
      ).length
    );
    elements.unpaidCount.textContent = String(
      state.filteredRows.filter((row) => (row.payment_status || "unpaid") === "unpaid")
        .length
    );
    elements.candidateCount.textContent = String(
      state.filteredRows.filter(
        (row) =>
          isOneToOne(row) && (row.matching_status || "unmatched") === "unmatched"
      ).length
    );
    elements.matchedCount.textContent = String(
      state.filteredRows.filter(
        (row) =>
          isOneToOne(row) && (row.matching_status || "unmatched") === "matched"
      ).length
    );
    elements.tableCaption.textContent = `${state.filteredRows.length}명을 표시 중입니다. 헤더를 클릭하면 정렬됩니다.`;
  }

  function renderTable() {
    elements.tableBody.innerHTML = "";
    elements.mobileList.innerHTML = "";

    state.filteredRows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.toggle("is-selected", state.selectedRow?.id === row.id);
      tr.innerHTML = `
        <td data-label="접수">${escapeHtml(formatDateTime(row.submitted_at))}</td>
        <td data-label="이름">${escapeHtml(row.name)}</td>
        <td data-label="나이">${escapeHtml(row.age)}</td>
        <td data-label="성별"><span class="gender-pill" data-gender="${escapeHtml(
          row.gender
        )}">${escapeHtml(row.gender || "-")}</span></td>
        <td data-label="입금"><span class="status-pill" data-status="${escapeHtml(
          row.payment_status || "unpaid"
        )}">${escapeHtml(getPaymentLabel(row.payment_status))}</span></td>
        <td data-label="1:1 매칭">${
          isOneToOne(row)
            ? `<span class="status-pill" data-status="${escapeHtml(
                row.matching_status || "unmatched"
              )}">${escapeHtml(getMatchingLabel(row.matching_status))}</span>`
            : "-"
        }</td>
        <td data-label="프로그램"><span class="program-pill" data-program="${escapeHtml(
          row.program_type
        )}">${escapeHtml(getProgramLabel(row.program_type))}</span></td>
        <td data-label="학교">${escapeHtml(row.school)}</td>
        <td data-label="일정">${escapeHtml(row.preferred_date)}</td>
        <td data-label="매칭 선택">${
          isOneToOne(row)
            ? `<button class="ghost-button" type="button" data-select-match="${escapeHtml(
                row.id
              )}">상태</button>`
            : "-"
        }</td>
      `;

      tr.addEventListener("click", () => selectRow(row));
      tr.querySelector("[data-select-match]")?.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();
          selectMatchCandidate(row);
        }
      );

      elements.tableBody.appendChild(tr);
    });

    renderMobileFlow();
    getMobileRows().forEach((row) => {
      elements.mobileList.appendChild(createMobileCard(row));
    });
  }

  function renderMobileFlow() {
    elements.mobileProgramButtons.forEach((button) => {
      const isSelected = button.dataset.mobileProgram === state.mobileProgramType;
      button.classList.toggle("is-selected", isSelected);
    });

    elements.mobileDateChoices.innerHTML = "";

    if (!state.mobileProgramType) {
      elements.mobileDateChoices.hidden = true;
      elements.mobileFlowHint.textContent = "프로그램을 선택해주세요.";
      return;
    }

    if (state.mobileProgramType === "1:1 카톡 소개팅") {
      const count = getMobileRows().length;
      elements.mobileDateChoices.hidden = true;
      elements.mobileFlowHint.textContent = `1대1 신청자 ${count}명을 표시 중입니다.`;
      return;
    }

    const dates = getMobileRotationDates();
    elements.mobileDateChoices.hidden = false;

    dates.forEach((date) => {
      const button = document.createElement("button");
      button.className = "ghost-button";
      button.type = "button";
      button.textContent = date;
      button.classList.toggle("is-selected", state.mobileDate === date);
      button.addEventListener("click", () => {
        state.mobileDate = state.mobileDate === date ? "" : date;
        renderTable();
      });
      elements.mobileDateChoices.appendChild(button);
    });

    if (dates.length === 0) {
      elements.mobileFlowHint.textContent = "표시할 로테이션 일정이 없습니다.";
      return;
    }

    if (!state.mobileDate) {
      elements.mobileFlowHint.textContent = "확인할 날짜를 선택해주세요.";
      return;
    }

    elements.mobileFlowHint.textContent = `${state.mobileDate} 신청자 ${
      getMobileRows().length
    }명을 표시 중입니다.`;
  }

  function getMobileRotationDates() {
    return Array.from(
      new Set(
        state.filteredRows
          .filter((row) => row.program_type === "다대다 로테이션 소개팅")
          .map((row) => row.preferred_date)
          .filter(Boolean)
      )
    );
  }

  function getMobileRows() {
    if (!state.mobileProgramType) {
      return [];
    }

    if (state.mobileProgramType === "1:1 카톡 소개팅") {
      return state.filteredRows.filter(
        (row) => row.program_type === "1:1 카톡 소개팅"
      );
    }

    if (!state.mobileDate) {
      return [];
    }

    return state.filteredRows.filter(
      (row) =>
        row.program_type === "다대다 로테이션 소개팅" &&
        row.preferred_date === state.mobileDate
    );
  }

  function createMobileCard(row) {
    const card = document.createElement("article");
    const isSelected = state.selectedRow?.id === row.id;
    card.className = "mobile-response-card";
    card.classList.toggle("is-expanded", isSelected);

    card.innerHTML = `
      <button class="mobile-response-summary" type="button" aria-expanded="${
        isSelected ? "true" : "false"
      }">
        <span class="mobile-line-name">${escapeHtml(row.name || "이름 없음")}</span>
        <span class="mobile-line-gender" data-gender="${escapeHtml(row.gender)}">${escapeHtml(
      getMobileGenderLabel(row.gender)
    )}</span>
        <span>${escapeHtml(row.age ? `${row.age}세` : "-")}</span>
        <span class="mobile-line-status" data-status="${escapeHtml(
          row.payment_status || "unpaid"
        )}">${escapeHtml(getPaymentLabel(row.payment_status))}</span>
        ${
          isOneToOne(row)
            ? `<span class="mobile-line-status" data-status="${escapeHtml(
                row.matching_status || "unmatched"
              )}">${escapeHtml(getMatchingLabel(row.matching_status))}</span>`
            : ""
        }
      </button>
    `;

    card
      .querySelector(".mobile-response-summary")
      .addEventListener("click", () => {
        if (state.selectedRow?.id === row.id) {
          clearSelectedRow();
          return;
        }

        selectRow(row);
      });

    if (isSelected) {
      const detail = document.createElement("div");
      detail.className = "mobile-response-detail";
      detail.appendChild(createMobileDetail(row));

      const actions = document.createElement("div");
      actions.className = "mobile-response-actions";
      actions.innerHTML = `
        ${
          isOneToOne(row)
            ? '<button class="ghost-button" type="button" data-mobile-match>매칭상태</button>'
            : ""
        }
        <button class="primary-button" type="button" data-mobile-edit>입금 수정</button>
      `;
      actions
        .querySelector("[data-mobile-match]")
        ?.addEventListener("click", () => selectMatchCandidate(row));
      actions.querySelector("[data-mobile-edit]").addEventListener("click", () => {
        elements.reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      detail.appendChild(actions);
      card.appendChild(detail);
    }

    return card;
  }

  function createMobileDetail(row) {
    const detail = document.createElement("div");
    detail.className = "mobile-detail-grid";

    const fields = [
      ["연락처", row.phone],
      ["카카오", row.kakao_id],
      ["학교", `${row.school || ""} ${row.major || ""}`.trim()],
      ["거주지", row.residence],
      ["상태", row.job],
      ["키/몸무게", [row.height_cm, row.weight_kg].filter(Boolean).join(" / ")],
      ["흡연", row.smoking],
      ["입금", getPaymentLabel(row.payment_status)],
      ...(isOneToOne(row)
        ? [["1:1 매칭", getMatchingLabel(row.matching_status)]]
        : []),
      ["동반", row.companion_name],
      ["음료", `${row.drink || ""} ${row.drink_temperature || ""}`.trim()],
      ["접수", formatDateTime(row.submitted_at)],
    ];

    fields.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "mobile-detail-item";
      item.innerHTML = `
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "-")}</strong>
      `;
      detail.appendChild(item);
    });

    [
      ["선호연령", row.preferred_age],
      ["회피연령", row.avoided_age],
      ["회피지인", row.avoided_person],
      ["이상형", row.ideal_type],
      ["자기소개", row.self_intro],
    ].forEach(([label, value]) => {
      if (!value) {
        return;
      }

      const item = document.createElement("div");
      item.className = "mobile-detail-item mobile-detail-wide";
      item.innerHTML = `
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      `;
      detail.appendChild(item);
    });

    const files = document.createElement("div");
    files.className = "mobile-detail-item mobile-detail-wide";
    files.innerHTML = "<span>첨부</span>";
    const fileValue = document.createElement("strong");
    renderFiles(fileValue, row);
    files.appendChild(fileValue);
    detail.appendChild(files);

    return detail;
  }

  function selectRow(row) {
    state.selectedRow = row;
    elements.emptyDetail.hidden = true;
    elements.detailContent.hidden = false;
    elements.paymentStatus.value = row.payment_status || "unpaid";
    elements.matchingStatusField.hidden = !isOneToOne(row);
    elements.matchingStatus.value = isOneToOne(row)
      ? row.matching_status || "unmatched"
      : "unmatched";
    renderDetail(row);
    renderTable();
  }

  function clearSelectedRow() {
    state.selectedRow = null;
    elements.emptyDetail.hidden = false;
    elements.detailContent.hidden = true;
    elements.detailContent.innerHTML = "";
    elements.matchingStatusField.hidden = true;
    renderTable();
  }

  function renderDetail(row) {
    elements.detailContent.innerHTML = "";
    elements.detailContent.appendChild(createDetailList(row));
  }

  function createDetailList(row) {
    const fields = [
      ["접수", formatDateTime(row.submitted_at)],
      ["입금상태", getPaymentLabel(row.payment_status)],
      ...(isOneToOne(row)
        ? [["1:1 매칭상태", getMatchingLabel(row.matching_status)]]
        : []),
      ["이름", row.name],
      ["연락처", row.phone],
      ["카카오", row.kakao_id],
      ["성별", row.gender],
      ["나이", row.age],
      ["학교", `${row.school || ""} ${row.major || ""}`.trim()],
      ["거주지", row.residence],
      ["상태", row.job],
      ["키/몸무게", [row.height_cm, row.weight_kg].filter(Boolean).join(" / ")],
      ["흡연", row.smoking],
      ["일정", row.preferred_date],
      ["프로그램", row.program_type],
      ["동반", row.companion_name],
      ["선호연령", row.preferred_age],
      ["회피연령", row.avoided_age],
      ["회피지인", row.avoided_person],
      ["이상형", row.ideal_type],
      ["자기소개", row.self_intro],
      ["음료", `${row.drink || ""} ${row.drink_temperature || ""}`.trim()],
    ];

    const dl = document.createElement("dl");
    dl.className = "detail-list";

    fields.forEach(([label, value]) => {
      const wrapper = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      wrapper.className = "detail-row";
      dt.textContent = label;
      dd.textContent = value || "-";
      wrapper.append(dt, dd);
      dl.appendChild(wrapper);
    });

    const fileRow = document.createElement("div");
    const fileLabel = document.createElement("dt");
    const fileValue = document.createElement("dd");
    fileRow.className = "detail-row";
    fileLabel.textContent = "첨부";
    renderFiles(fileValue, row);
    fileRow.append(fileLabel, fileValue);
    dl.appendChild(fileRow);

    return dl;
  }

  function renderFiles(target, row) {
    const files = [
      ...(Array.isArray(row.student_file) ? row.student_file : []),
      ...(Array.isArray(row.profile_photos) ? row.profile_photos : []),
    ];

    if (files.length === 0) {
      target.textContent = "-";
      return;
    }

    files.forEach((file) => {
      const button = document.createElement("button");
      button.className = "file-button";
      button.type = "button";
      button.textContent = file.name || file.path;
      button.addEventListener("click", () => openSignedFile(file));
      target.appendChild(button);
    });
  }

  async function openSignedFile(file) {
    const { data, error } = await client.storage
      .from(file.bucket || "application-files")
      .createSignedUrl(file.path, 60 * 5);

    if (error) {
      setMessage(elements.reviewMessage, error.message, true);
      return;
    }

    window.open(data.signedUrl, "_blank", "noreferrer");
  }

  function selectMatchCandidate(row) {
    if (!isOneToOne(row)) {
      setMessage(elements.reviewMessage, "1:1 카톡 소개팅 신청자만 수정할 수 있습니다.", true);
      return;
    }

    selectRow(row);
    elements.reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
    setMessage(elements.reviewMessage, "상태를 선택한 뒤 저장해주세요.");
  }

  async function saveReview(event) {
    event.preventDefault();

    if (!state.selectedRow) {
      setMessage(elements.reviewMessage, "먼저 신청자를 선택해주세요.", true);
      return;
    }

    const updates = {
      payment_status: elements.paymentStatus.value,
      reviewed_at: new Date().toISOString(),
    };

    if (isOneToOne(state.selectedRow)) {
      updates.matching_status = elements.matchingStatus.value;
    } else {
      updates.matching_status = null;
    }

    const { error } = await client
      .from("application_submissions")
      .update(updates)
      .eq("id", state.selectedRow.id);

    if (error) {
      setMessage(elements.reviewMessage, error.message, true);
      return;
    }

    setMessage(elements.reviewMessage, "저장했습니다.");
    await loadData();
    const updated = state.rows.find((row) => row.id === state.selectedRow.id);
    if (updated) {
      selectRow(updated);
    }
  }

  function renderSummary() {
    const responseRows = buildResponseSummary();
    const drinkRows = buildDrinkSummary();

    elements.responseSummary.innerHTML = renderMiniTable(responseRows, [
      ["일정", "preferred_date"],
      ["프로그램", "program_type"],
      ["입금", "payment_status"],
      ["1:1 매칭", "matching_status"],
      ["전체", "total_count"],
      ["남", "male_count"],
      ["여", "female_count"],
    ]);

    elements.drinkSummary.innerHTML = renderMiniTable(drinkRows, [
      ["일정", "preferred_date"],
      ["음료", "drink"],
      ["온도", "drink_temperature"],
      ["수량", "total_count"],
    ]);
  }

  function buildResponseSummary() {
    const groups = new Map();

    state.rows.forEach((row) => {
      const key = [
        row.preferred_date || "",
        row.program_type || "",
        row.payment_status || "unpaid",
        isOneToOne(row) ? row.matching_status || "unmatched" : "",
      ].join("|");

      if (!groups.has(key)) {
        groups.set(key, {
          preferred_date: row.preferred_date || "",
          program_type: row.program_type || "",
          payment_status: row.payment_status || "unpaid",
          matching_status: isOneToOne(row)
            ? row.matching_status || "unmatched"
            : "-",
          total_count: 0,
          male_count: 0,
          female_count: 0,
        });
      }

      const group = groups.get(key);
      group.total_count += 1;
      if (row.gender === "남성") {
        group.male_count += 1;
      }
      if (row.gender === "여성") {
        group.female_count += 1;
      }
    });

    return Array.from(groups.values());
  }

  function buildDrinkSummary() {
    const groups = new Map();

    state.rows
      .filter((row) => row.payment_status === "paid")
      .forEach((row) => {
        const key = [
          row.preferred_date || "",
          row.drink || "",
          row.drink_temperature || "",
        ].join("|");

        if (!groups.has(key)) {
          groups.set(key, {
            preferred_date: row.preferred_date || "",
            drink: row.drink || "",
            drink_temperature: row.drink_temperature || "",
            total_count: 0,
          });
        }

        groups.get(key).total_count += 1;
      });

    return Array.from(groups.values());
  }

  function renderMiniTable(rows, columns) {
    if (rows.length === 0) {
      return '<p class="empty-state">표시할 데이터가 없습니다.</p>';
    }

    return `
      <table>
        <thead>
          <tr>${columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${columns
                    .map(([, key]) => `<td>${escapeHtml(formatSummaryValue(key, row[key]))}</td>`)
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function formatSummaryValue(key, value) {
    if (key === "payment_status") {
      return (
        {
          unpaid: "미입금",
          deposit_paid: "예약금",
          paid: "입금",
          refunded: "환불",
          waived: "면제",
        }[value] ||
        value ||
        "-"
      );
    }

    if (key === "matching_status") {
      return (
        {
          unmatched: "미매칭",
          match: "매칭",
          matched: "매칭",
          candidate: "후보",
          notified: "안내완료",
          cancelled: "취소",
        }[value] ||
        value ||
        "-"
      );
    }

    return value || "-";
  }

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(elements.loginMessage, "로그인 중입니다.");

    const { error } = await client.auth.signInWithPassword({
      email: elements.loginEmail.value.trim(),
      password: elements.loginPassword.value,
    });

    if (error) {
      setMessage(elements.loginMessage, error.message, true);
      return;
    }

    if (await requireAdmin()) {
      await loadData();
    }
  });

  elements.logoutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
  });

  [
    elements.searchInput,
    elements.dateFilter,
    elements.programFilter,
    elements.genderFilter,
    elements.paymentFilter,
    elements.matchingFilter,
  ].forEach((element) => {
    element.addEventListener("input", applyFilters);
    element.addEventListener("change", applyFilters);
  });

  elements.refreshButton.addEventListener("click", loadData);
  elements.reviewForm.addEventListener("submit", saveReview);
  elements.mobileProgramButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextProgram = button.dataset.mobileProgram;
      state.mobileProgramType =
        state.mobileProgramType === nextProgram ? "" : nextProgram;
      state.mobileDate = "";
      elements.dateFilter.value = "";
      elements.programFilter.value = "";
      clearSelectedRow();
    });
  });
  document.querySelectorAll("[data-sort-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const sortKey = button.dataset.sortKey;
      if (state.sortKey === sortKey) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = sortKey;
        state.sortDirection = sortKey === "submitted_at" ? "desc" : "asc";
      }
      applyFilters();
    });
  });

  requireAdmin().then((isAdmin) => {
    if (isAdmin) {
      loadData();
    }
  });
})();
