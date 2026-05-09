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
    choiceCount: document.getElementById("choice-count"),
    topVoteRecipient: document.getElementById("top-vote-recipient"),
    tableCaption: document.getElementById("table-caption"),
    searchInput: document.getElementById("search-input"),
    dateFilter: document.getElementById("date-filter"),
    genderFilter: document.getElementById("gender-filter"),
    afterFilter: document.getElementById("after-filter"),
    satisfactionFilter: document.getElementById("satisfaction-filter"),
    refreshButton: document.getElementById("refresh-button"),
    tableBody: document.getElementById("review-table-body"),
    mobileList: document.getElementById("mobile-review-list"),
    voteRanking: document.getElementById("vote-ranking"),
    choiceFlow: document.getElementById("choice-flow"),
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
    renderVoteRanking();
    renderChoiceFlow();
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
    const voteStats = getVoteStats(state.filteredRows);
    const topRecipient = voteStats[0];

    elements.totalCount.textContent = String(state.filteredRows.length);
    elements.afterCount.textContent = String(
      state.filteredRows.filter((row) => row.has_after_interest === "있었다").length
    );
    elements.mutualCount.textContent = String(mutualPairs.length);
    elements.choiceCount.textContent = String(
      voteStats.reduce((sum, item) => sum + item.total, 0)
    );
    elements.topVoteRecipient.textContent = topRecipient
      ? `${topRecipient.number} ${topRecipient.name || ""} (${topRecipient.total}표)`.trim()
      : "-";
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
        <td class="choice-cell" data-label="1순위">${renderChoiceCell(row.first_choice)}</td>
        <td class="choice-cell" data-label="2순위">${renderChoiceCell(row.second_choice)}</td>
        <td class="choice-cell" data-label="3순위">${renderChoiceCell(row.third_choice)}</td>
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
        <span>${escapeHtml(row.participant_number || "-")}</span>
        <span>${escapeHtml(row.event_date || "-")}</span>
        <span class="mobile-line-status">${escapeHtml(row.has_after_interest || "-")}</span>
        <span class="mobile-line-choice">${escapeHtml(
          getParticipantLabel(row.first_choice) || "선택 없음"
        )}</span>
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
    const inboundChoices = getInboundChoices(row, state.filteredRows);
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
      [
        "나를 선택한 사람",
        inboundChoices.length
          ? inboundChoices
              .map(
                (choice) =>
                  `${choice.rank}순위 ${getParticipantLabel(choice.from.participant_number)}`
              )
              .join("\n")
          : "없음",
      ],
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
    return [
      { rank: 1, value: row.first_choice },
      { rank: 2, value: row.second_choice },
      { rank: 3, value: row.third_choice },
    ]
      .map((choice) => ({
        ...choice,
        number: normalizeParticipantNumber(choice.value),
      }))
      .filter((choice) => choice.number);
  }

  function getMatchingChoices(row) {
    return getChoices(row).filter((choice) => choice.rank <= 2);
  }

  function getParticipantMap(rows = state.rows) {
    return rows.reduce((map, row) => {
      const number = normalizeParticipantNumber(row.participant_number);
      if (number && !map.has(number)) {
        map.set(number, row);
      }
      return map;
    }, new Map());
  }

  function getParticipantLabel(number, rows = state.rows) {
    const normalized = normalizeParticipantNumber(number);
    if (!normalized) {
      return "";
    }

    const participant = getParticipantMap(rows).get(normalized);
    return participant?.reviewer_name
      ? `${normalized} / ${participant.reviewer_name}`
      : normalized;
  }

  function renderChoiceCell(number) {
    const label = getParticipantLabel(number);
    return label ? escapeHtml(label) : "-";
  }

  function getMatchingChoiceRows(rows) {
    return rows.flatMap((row) =>
      getMatchingChoices(row).map((choice) => ({
        from: row,
        toNumber: choice.number,
        rank: choice.rank,
      }))
    );
  }

  function getVoteStats(rows) {
    const participantMap = getParticipantMap(state.rows);
    const stats = new Map();

    getMatchingChoiceRows(rows).forEach((choice) => {
      if (!stats.has(choice.toNumber)) {
        const participant = participantMap.get(choice.toNumber);
        stats.set(choice.toNumber, {
          number: choice.toNumber,
          name: participant?.reviewer_name || "",
          total: 0,
          ranks: { 1: 0, 2: 0, 3: 0 },
          voters: [],
        });
      }

      const item = stats.get(choice.toNumber);
      item.total += 1;
      item.ranks[choice.rank] += 1;
      item.voters.push(choice);
    });

    return Array.from(stats.values()).sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      if (b.ranks[1] !== a.ranks[1]) {
        return b.ranks[1] - a.ranks[1];
      }
      return a.number.localeCompare(b.number, "ko", { numeric: true });
    });
  }

  function getInboundChoices(row, rows) {
    const myNumber = normalizeParticipantNumber(row.participant_number);
    if (!myNumber) {
      return [];
    }

    return getMatchingChoiceRows(rows)
      .filter((choice) => choice.toNumber === myNumber)
      .sort((a, b) => a.rank - b.rank);
  }

  function renderVoteRanking() {
    const ranking = getVoteStats(state.filteredRows);

    if (ranking.length === 0) {
      elements.voteRanking.innerHTML =
        '<p class="empty-state">표시할 선택 데이터가 없습니다.</p>';
      return;
    }

    elements.voteRanking.innerHTML = ranking
      .map((item, index) => {
        const voters = item.voters
          .sort((a, b) => a.rank - b.rank)
          .map(
            (choice) =>
              `<span>${escapeHtml(choice.rank)}순위 ${escapeHtml(
                getParticipantLabel(choice.from.participant_number)
              )}</span>`
          )
          .join("");

        return `
          <article class="vote-card">
            <div class="vote-card-main">
              <span class="rank-badge">${index + 1}</span>
              <div>
                <strong>${escapeHtml(getParticipantLabel(item.number))}</strong>
                <p>1순위 ${item.ranks[1]}표 · 2순위 ${item.ranks[2]}표</p>
              </div>
              <b>${item.total}표</b>
            </div>
            <div class="vote-card-voters">${voters}</div>
          </article>
        `;
      })
      .join("");
  }

  function renderChoiceFlow() {
    const choiceRows = getMatchingChoiceRows(state.filteredRows);

    if (choiceRows.length === 0) {
      elements.choiceFlow.innerHTML =
        '<p class="empty-state">1·2순위 선택 리뷰가 없습니다.</p>';
      return;
    }

    elements.choiceFlow.innerHTML = choiceRows
      .map(
        (choice) => `
          <article class="choice-flow-row">
            <span>${escapeHtml(getParticipantLabel(choice.from.participant_number))}</span>
            <strong>${escapeHtml(choice.rank)}순위</strong>
            <span>${escapeHtml(getParticipantLabel(choice.toNumber))}</span>
          </article>
        `
      )
      .join("");
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
          getMatchingChoices(row).some((choice) => choice.number === otherNumber) &&
          getMatchingChoices(other).some((choice) => choice.number === myNumber);

        if (!isMutual) {
          return;
        }

        const firstChoice = getMatchingChoices(row).find(
          (choice) => choice.number === otherNumber
        );
        const secondChoice = getMatchingChoices(other).find(
          (choice) => choice.number === myNumber
        );
        const key = [myNumber, otherNumber].sort().join("|");
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        pairs.push({ first: row, second: other, firstChoice, secondChoice });
      });
    });

    return pairs;
  }

  function renderMutualList() {
    const pairs = getMutualPairs(state.filteredRows);

    if (pairs.length === 0) {
      elements.mutualList.innerHTML =
        '<p class="empty-state">1·2순위 기준 매칭 결과가 없습니다.</p>';
      return;
    }

    elements.mutualList.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>참가자 A</th>
            <th>참가자 B</th>
            <th>선택 관계</th>
          </tr>
        </thead>
        <tbody>
          ${pairs
            .map(
              ({ first, second, firstChoice, secondChoice }) => `
                <tr>
                  <td>${escapeHtml(first.participant_number)} / ${escapeHtml(first.reviewer_name)}</td>
                  <td>${escapeHtml(second.participant_number)} / ${escapeHtml(second.reviewer_name)}</td>
                  <td>
                    ${escapeHtml(firstChoice.rank)}순위 ↔ ${escapeHtml(secondChoice.rank)}순위
                  </td>
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
