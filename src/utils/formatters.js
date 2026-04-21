(function () {
  window.App = window.App || {};

  const applicationStatusLabels = {
    submitted: "검토 전",
    reviewing: "검토 중",
    waiting_match: "매칭 대기",
    candidate_found: "후보 생성",
    matched: "매칭 완료",
    hold: "보류",
    closed: "종료"
  };

  const rotationStatusLabels = {
    confirmed: "확정",
    waitlisted: "대기열",
    closed: "마감",
    cancelled: "취소"
  };

  const matchStatusLabels = {
    candidate: "자동 후보",
    manual_candidate: "수동 후보",
    approved: "승인됨",
    completed: "완료",
    cancelled: "취소"
  };

  const matchTypeLabels = {
    auto: "자동매칭",
    manual: "수동매칭"
  };

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  function formatGender(value) {
    if (value === "male") {
      return "남성";
    }

    if (value === "female") {
      return "여성";
    }

    return value || "-";
  }

  function formatApplicationStatus(value) {
    return applicationStatusLabels[value] || value || "-";
  }

  function formatRotationStatus(value) {
    return rotationStatusLabels[value] || value || "-";
  }

  function formatMatchStatus(value) {
    return matchStatusLabels[value] || value || "-";
  }

  function formatMatchType(value) {
    return matchTypeLabels[value] || value || "-";
  }

  function formatBoolean(value, positiveLabel, negativeLabel) {
    return value ? positiveLabel : negativeLabel;
  }

  window.App.formatters = {
    formatDateTime: formatDateTime,
    formatGender: formatGender,
    formatApplicationStatus: formatApplicationStatus,
    formatRotationStatus: formatRotationStatus,
    formatMatchStatus: formatMatchStatus,
    formatMatchType: formatMatchType,
    formatBoolean: formatBoolean
  };
})();
