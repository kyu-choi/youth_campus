window.CheongchunCampus = window.CheongchunCampus || {};

(function setupReviewAdminPage() {
  const client = window.CheongchunCampus.services.getSupabaseClient();

  const state = {
    rows: [],
    filteredRows: [],
    selectedRow: null,
    sortKey: "submitted_at",
    sortDirection: "desc",
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
    afterCount: document.getElementById("after-count"),
    mutualCount: document.getElementById("mutual-count"),
    tableCaption: document.getElementById("table-caption"),
    searchInput: document.getElementById("search-input"),
    dateFilter: document.getElementById("date-filter"),
    genderFilter: document.getElementById("gender-filter"),
    afterFilter: document.getElementById("after-filter"),
    satisfactionFilter: document.getElementById("satisfaction-filter"),
    refreshButton: document.getElementById("refresh-button"),
    tableBody: document.getElementById("review-table-body"),
    mobileList: document.getElementById("mobile-review-list"),
    mutualList: document.getElementById("mutual-list"),
    emptyDetail: document.getElementById("empty-detail"),
    detailContent: document.getElementById("detail-content"),
    reviewMessage: document.getElementById("review-message"),
  };

  if (!client) {
    setMessage(elements.loginMessage, "Supabase 설정을 확인해주세요.", true);
    return;
  }

  function setMessage(target, message, isError = false) {
    target.textContent = message;
    target.classList.toggle("is-error", isError);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
      setMessage(elements.loginMessage, "관리자 권한이 없습니다.", true);
      return false;
    }

    showAdmin(session.user.email);
    return true;
  }

  async function loadData() {
    setMessage(elements.reviewMessage, "리뷰 정보를 불러오는 중입니다.");

    const responses = await client
      .from("review_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (responses.error) {
      setMessage(elements.reviewMessage, responses.error.message, true);
      return;
    }

    state.rows = (responses.data || []).map(normalizeReview);
    renderDateOptions();
    applyFilters();
    setMessage(elements.reviewMessage, "");
  }

  function normalizeReview(row) {
    const payload = row.payload || {};

    return {
      ...row,
      submitted_at: row.created_at,
      event_date: row.event_date || payload.event_date || "",
      reviewer_name: row.reviewer_name || payload.name || "",
      invite_kakao_id:
        row.invite_kakao_id ||
        payload.invite_kakao_id ||
        row.phone_last4 ||
        payload.phone_last4 ||
        "",
      participant_gender:
        row.participant_gender || payload.participant_gender || "",
      participant_number:
        row.participant_number || payload.participant_number || "",
      overall_satisfaction:
        row.overall_satisfaction || payload.overall_satisfaction || "",
      traffic_source: row.traffic_source || payload.traffic_source || "",
      has_after_interest:
        row.has_after_interest || payload.has_after_interest || "",
      first_choice: row.first_choice || payload.first_choice || "",
      second_choice: row.second_choice || payload.second_choice || "",
      third_choice: row.third_choice || payload.third_choice || "",
      choice_reason: row.choice_reason || payload.choice_reason || "",
      good_points: row.good_points || payload.good_points || "",
      improvement_points:
        row.improvement_points || payload.improvement_points || "",
      next_participation:
        row.next_participation || payload.next_participation || "",
    };
  }

  function renderDateOptions() {
    const currentValue = elements.dateFilter.value;
    const dates = Array.from(
      new Set(state.rows.map((row) => row.event_date).filter(Boolean))
    );

    elements.dateFilter.innerHTML = '<option value="">전체 날짜</option>';
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
    const gender = elements.genderFilter.value;
    const after = elements.afterFilter.value;
    const satisfaction = elements.satisfactionFilter.value;

    state.filteredRows = state.rows.filter((row) => {
      const haystack = [
        row.event_date,
        row.reviewer_name,
        row.invite_kakao_id,
        row.participant_gender,
        row.participant_number,
        row.first_choice,
        row.second_choice,
        row.third_choice,
        row.choice_reason,
        row.good_points,
        row.improvement_points,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!keyword || haystack.includes(keyword)) &&
        (!date || row.event_date === date) &&
        (!gender || row.participant_gender === gender) &&
        (!after || row.has_after_interest === after) &&
        (!satisfaction || row.overall_satisfaction === satisfaction)
      );
    });

    sortRows();
    renderCounters();
    renderTable();
    renderMutualList();
  }

  function sortRows() {
    const direction = state.sortDirection === "asc" ? 1 : -1;
    const key = state.sortKey;

    state.filteredRows.sort((a, b) => {
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      if (key === "submitted_at") {
        return (new Date(aValue) - new Date(bValue)) * direction;
      }

      return String(aValue).localeCompare(String(bValue), "ko") * direction;
    });
  }

  function renderCounters() {
    const mutualPairs = getMutualPairs(state.filteredRows);
    elements.totalCount.textContent = String(state.filteredRows.length);
    elements.afterCount.textContent = String(
      state.filteredRows.filter((row) => row.has_after_interest === "있었다").length
    );
    elements.mutualCount.textContent = String(mutualPairs.length);
    elements.tableCaption.textContent = `${state.filteredRows.length}개의 리뷰를 표시 중입니다.`;
  }

  function renderTable() {
    elements.tableBody.innerHTML = "";
    elements.mobileList.innerHTML = "";

    state.filteredRows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.toggle("is-selected", state.selectedRow?.id === row.id);
      tr.innerHTML = `
        <td data-label="제출">${escapeHtml(formatDateTime(row.submitted_at))}</td>
        <td data-label="날짜">${escapeHtml(row.event_date)}</td>
        <td data-label="이름">${escapeHtml(row.reviewer_name)}</td>
        <td data-label="카카오ID">${escapeHtml(row.invite_kakao_id || "-")}</td>
        <td data-label="본인번호">${escapeHtml(row.participant_number)}</td>
        <td data-label="만족도">${escapeHtml(row.overall_satisfaction)}</td>
        <td data-label="애프터">${escapeHtml(row.has_after_interest)}</td>
        <td data-label="1순위">${escapeHtml(row.first_choice || "-")}</td>
        <td data-label="2순위">${escapeHtml(row.second_choice || "-")}</td>
        <td data-label="3순위">${escapeHtml(row.third_choice || "-")}</td>
      `;
      tr.addEventListener("click", () => selectRow(row));
      elements.tableBody.appendChild(tr);
      elements.mobileList.appendChild(createMobileCard(row));
    });
  }

  function createMobileCard(row) {
    const card = document.createElement("article");
    const isSelected = state.selectedRow?.id === row.id;

    card.className = "mobile-response-card";
    card.classList.toggle("is-expanded", isSelected);
    card.innerHTML = `
      <button class="mobile-response-summary" type="button">
        <span class="mobile-line-name">${escapeHtml(row.reviewer_name || "이름 없음")}</span>
        <span>${escapeHtml(row.invite_kakao_id || "-")}</span>
        <span>${escapeHtml(row.participant_number || "-")}</span>
        <span>${escapeHtml(row.event_date || "-")}</span>
        <span>${escapeHtml(row.overall_satisfaction || "-")}</span>
        <span class="mobile-line-status">${escapeHtml(row.has_after_interest || "-")}</span>
      </button>
    `;

    card
      .querySelector(".mobile-response-summary")
      .addEventListener("click", () => selectRow(row));

    return card;
  }

  function selectRow(row) {
    state.selectedRow = row;
    elements.emptyDetail.hidden = true;
    elements.detailContent.hidden = false;
    renderDetail(row);
    renderTable();
  }

  function renderDetail(row) {
    const fields = [
      ["제출", formatDateTime(row.submitted_at)],
      ["참여 날짜", row.event_date],
      ["이름", row.reviewer_name],
      ["초대용 카카오톡 ID", row.invite_kakao_id],
      ["성별", row.participant_gender],
      ["본인 참가자 번호", row.participant_number],
      ["전체 만족도", row.overall_satisfaction],
      ["유입 경로", row.traffic_source],
      ["애프터 여부", row.has_after_interest],
      ["1순위", row.first_choice],
      ["2순위", row.second_choice],
      ["3순위", row.third_choice],
      ["선택 이유", row.choice_reason],
      ["좋았던 점", row.good_points],
      ["아쉬웠던 점", row.improvement_points],
      ["다음 참여 의향", row.next_participation],
    ];

    elements.detailContent.innerHTML = `
      <dl class="detail-list">
        ${fields
          .map(
            ([label, value]) => `
              <div class="detail-row">
                <dt>${escapeHtml(label)}</dt>
                <dd>${escapeHtml(value || "-")}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    `;
  }

  function normalizeParticipantNumber(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getChoices(row) {
    return [row.first_choice, row.second_choice, row.third_choice]
      .map(normalizeParticipantNumber)
      .filter(Boolean);
  }

  function getMutualPairs(rows) {
    const pairs = [];
    const seen = new Set();

    rows.forEach((row) => {
      const myNumber = normalizeParticipantNumber(row.participant_number);
      if (!myNumber) {
        return;
      }

      rows.forEach((other) => {
        if (row.id === other.id) {
          return;
        }

        const otherNumber = normalizeParticipantNumber(other.participant_number);
        if (!otherNumber) {
          return;
        }

        const isMutual =
          getChoices(row).includes(otherNumber) &&
          getChoices(other).includes(myNumber);

        if (!isMutual) {
          return;
        }

        const key = [row.id, other.id].sort().join("|");
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        pairs.push({ first: row, second: other });
      });
    });

    return pairs;
  }

  function renderMutualList() {
    const pairs = getMutualPairs(state.filteredRows);

    if (pairs.length === 0) {
      elements.mutualList.innerHTML =
        '<p class="empty-state">상호 선택 후보가 없습니다.</p>';
      return;
    }

    elements.mutualList.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>참가자 A</th>
            <th>참가자 B</th>
          </tr>
        </thead>
        <tbody>
          ${pairs
            .map(
              ({ first, second }) => `
                <tr>
                  <td>${escapeHtml(first.participant_number)} / ${escapeHtml(first.reviewer_name)}</td>
                  <td>${escapeHtml(second.participant_number)} / ${escapeHtml(second.reviewer_name)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
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
    elements.genderFilter,
    elements.afterFilter,
    elements.satisfactionFilter,
  ].forEach((element) => {
    element.addEventListener("input", applyFilters);
    element.addEventListener("change", applyFilters);
  });

  elements.refreshButton.addEventListener("click", loadData);
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
