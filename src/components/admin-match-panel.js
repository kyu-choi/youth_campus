(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useEffect = React.useEffect;
  const useState = React.useState;

  function AdminMatchPanel(config) {
    const applicationDetail = config.applicationDetail;
    const [selectedStatus, setSelectedStatus] = useState(
      applicationDetail ? applicationDetail.application.application_status : "submitted"
    );
    const [note, setNote] = useState("");
    const [manualTargetId, setManualTargetId] = useState("");
    const [manualReason, setManualReason] = useState("");

    useEffect(
      function () {
        if (!applicationDetail) {
          return;
        }

        setSelectedStatus(applicationDetail.application.application_status);
        setManualTargetId("");
        setManualReason("");
        setNote("");
      },
      [applicationDetail]
    );

    if (!applicationDetail) {
      return window.App.renderSection({
        title: "1대1 신청 상세",
        description: "왼쪽 목록에서 신청자를 선택해 주세요.",
        content: window.App.renderEmptyState("선택된 신청자가 없습니다.")
      });
    }

    return e(
      "div",
      { className: "admin-detail-stack" },
      window.App.renderSection({
        title: applicationDetail.profile.name + " 신청 상세",
        description: [
          window.App.formatters.formatGender(applicationDetail.profile.gender),
          applicationDetail.profile.age + "세",
          applicationDetail.profile.university,
          applicationDetail.profile.region
        ].join(" · "),
        content: e(
          "div",
          { className: "detail-grid" },
          window.App.renderKeyValueRows([
            { label: "연락처", value: applicationDetail.profile.phone },
            { label: "카카오톡 ID", value: applicationDetail.profile.kakao_id || "-" },
            { label: "본인 스타일", value: applicationDetail.matchProfile.self_style || "-" },
            {
              label: "선호 스타일 1순위",
              value: applicationDetail.matchProfile.preferred_style_rank_1 || "-"
            },
            {
              label: "선호 스타일 2순위",
              value: applicationDetail.matchProfile.preferred_style_rank_2 || "-"
            },
            {
              label: "선호 스타일 3순위",
              value: applicationDetail.matchProfile.preferred_style_rank_3 || "-"
            },
            {
              label: "선호 나이",
              value:
                applicationDetail.matchProfile.preferred_age_min +
                " - " +
                applicationDetail.matchProfile.preferred_age_max
            },
            {
              label: "선호 키",
              value:
                applicationDetail.matchProfile.preferred_height_min +
                " - " +
                applicationDetail.matchProfile.preferred_height_max
            },
            { label: "음주", value: applicationDetail.matchProfile.drinking },
            { label: "흡연", value: applicationDetail.matchProfile.smoking },
            { label: "종교", value: applicationDetail.matchProfile.religion },
            { label: "가능 일정", value: applicationDetail.matchProfile.available_schedule || "-" },
            { label: "자기소개", value: applicationDetail.matchProfile.intro || "-" }
          ])
        )
      }),
      window.App.renderSection({
        title: "상태 관리",
        content: e(
          "div",
          { className: "stack-form" },
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "신청 상태"),
            e(
              "select",
              {
                className: "text-input",
                value: selectedStatus,
                onChange: function (event) {
                  setSelectedStatus(event.target.value);
                }
              },
              ...window.App.text.formOptions.matchStatuses.map(function (status) {
                return e(
                  "option",
                  { key: status, value: status },
                  window.App.formatters.formatApplicationStatus(status)
                );
              })
            )
          ),
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "운영 메모"),
            e("textarea", {
              className: "text-area",
              rows: 4,
              value: note,
              placeholder: "검토 내용, 보류 사유, 후보 판단 근거를 기록합니다.",
              onChange: function (event) {
                setNote(event.target.value);
              }
            })
          ),
          e(
            "div",
            { className: "form-actions is-inline" },
            e(
              "button",
              {
                className: "primary-button",
                type: "button",
                onClick: function () {
                  config.onUpdateStatus(selectedStatus, note);
                  setNote("");
                }
              },
              "상태 저장"
            ),
            e(
              "button",
              {
                className: "secondary-button",
                type: "button",
                onClick: function () {
                  config.onSaveNote(note);
                  setNote("");
                }
              },
              "메모만 저장"
            )
          )
        )
      }),
      window.App.renderSection({
        title: "수동매칭",
        description: "자동 후보를 취소한 뒤 관리자 판단으로 직접 매칭 후보를 생성할 수 있습니다.",
        content: e(
          "div",
          { className: "stack-form" },
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "수동매칭 대상"),
            e(
              "select",
              {
                className: "text-input",
                value: manualTargetId,
                onChange: function (event) {
                  setManualTargetId(event.target.value);
                }
              },
              e("option", { value: "" }, "대상 선택"),
              ...config.manualCandidates.map(function (candidate) {
                return e(
                  "option",
                  { key: candidate.application.id, value: candidate.application.id },
                  candidate.profile.name +
                    " · " +
                    candidate.matchProfile.self_style +
                    " · " +
                    candidate.profile.region
                );
              })
            )
          ),
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "수동매칭 사유"),
            e("textarea", {
              className: "text-area",
              rows: 3,
              value: manualReason,
              placeholder: "예: 1순위 스타일은 다르지만 대화 성향과 일정이 잘 맞아 수동 후보로 생성",
              onChange: function (event) {
                setManualReason(event.target.value);
              }
            })
          ),
          e(
            "button",
            {
              className: "primary-button",
              type: "button",
              onClick: function () {
                config.onManualMatch(manualTargetId, manualReason);
                setManualTargetId("");
                setManualReason("");
              }
            },
            "수동매칭 실행"
          )
        )
      }),
      window.App.renderSection({
        title: "매칭 결과",
        content:
          config.matches.length > 0
            ? e(
                "div",
                { className: "match-result-list" },
                ...config.matches.map(function (item) {
                  const partner =
                    item.application1 &&
                    item.application1.application.id === applicationDetail.application.id
                      ? item.application2
                      : item.application1;

                  return e(
                    "article",
                    { key: item.match.id, className: "match-card" },
                    e(
                      "div",
                      { className: "match-card-head" },
                      e(
                        "strong",
                        null,
                        partner ? partner.profile.name + " 후보" : "상대 정보 없음"
                      ),
                      e(
                        "div",
                        { className: "match-pill-row" },
                        window.App.renderPill(
                          window.App.formatters.formatMatchType(item.match.match_type),
                          item.match.match_type
                        ),
                        window.App.renderPill(
                          window.App.formatters.formatMatchStatus(item.match.status),
                          item.match.status
                        )
                      )
                    ),
                    e(
                      "p",
                      { className: "match-card-meta" },
                      "우선순위 점수 " +
                        item.match.style_priority_score +
                        " · 총점 " +
                        item.match.match_score
                    ),
                    e("p", { className: "match-card-meta" }, item.match.match_reason),
                    e(
                      "div",
                      { className: "form-actions is-inline" },
                      item.match.status !== "approved" && item.match.status !== "completed"
                        ? e(
                            "button",
                            {
                              className: "secondary-button",
                              type: "button",
                              onClick: function () {
                                config.onApproveMatch(item.match.id);
                              }
                            },
                            "승인"
                          )
                        : null,
                      item.match.status !== "completed" && item.match.status !== "cancelled"
                        ? e(
                            "button",
                            {
                              className: "primary-button",
                              type: "button",
                              onClick: function () {
                                config.onCompleteMatch(item.match.id);
                              }
                            },
                            "완료 처리"
                          )
                        : null,
                      item.match.status !== "completed" &&
                      item.match.status !== "cancelled"
                        ? e(
                            "button",
                            {
                              className: "ghost-button",
                              type: "button",
                              onClick: function () {
                                config.onCancelMatch(item.match.id);
                              }
                            },
                            "취소"
                          )
                        : null
                    )
                  );
                })
              )
            : window.App.renderEmptyState("아직 생성된 매칭 결과가 없습니다.")
      }),
      window.App.renderSection({
        title: "운영 메모 기록",
        content:
          config.notes.length > 0
            ? e(
                "div",
                { className: "note-list" },
                ...config.notes.map(function (record) {
                  return e(
                    "article",
                    { key: record.id, className: "note-card" },
                    e("strong", null, record.admin_action || "memo"),
                    e("p", null, record.note),
                    e(
                      "p",
                      { className: "note-date" },
                      window.App.formatters.formatDateTime(record.created_at)
                    )
                  );
                })
              )
            : window.App.renderEmptyState("아직 저장된 메모가 없습니다.")
      })
    );
  }

  window.App.AdminMatchPanel = AdminMatchPanel;
})();
