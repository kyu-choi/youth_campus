(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useEffect = React.useEffect;
  const useState = React.useState;

  function AdminRotationPanel(config) {
    const applicationDetail = config.applicationDetail;
    const [selectedStatus, setSelectedStatus] = useState(
      applicationDetail ? applicationDetail.application.application_status : "confirmed"
    );
    const [note, setNote] = useState("");

    useEffect(
      function () {
        if (!applicationDetail) {
          return;
        }

        setSelectedStatus(applicationDetail.application.application_status);
        setNote("");
      },
      [applicationDetail]
    );

    if (!applicationDetail) {
      return window.App.renderSection({
        title: "로테이션 신청 상세",
        description: "왼쪽 목록에서 신청자를 선택해 주세요.",
        content: window.App.renderEmptyState("선택된 신청자가 없습니다.")
      });
    }

    const eventStat = config.eventStat;

    return e(
      "div",
      { className: "admin-detail-stack" },
      window.App.renderSection({
        title: applicationDetail.profile.name + " 회차 신청 상세",
        description: [
          applicationDetail.event ? applicationDetail.event.title : "회차 정보 없음",
          window.App.formatters.formatGender(applicationDetail.profile.gender),
          applicationDetail.profile.age + "세",
          applicationDetail.profile.university
        ].join(" · "),
        content: e(
          "div",
          { className: "detail-grid" },
          window.App.renderKeyValueRows([
            { label: "연락처", value: applicationDetail.profile.phone },
            { label: "카카오톡 ID", value: applicationDetail.profile.kakao_id || "-" },
            {
              label: "신청 상태",
              value: window.App.formatters.formatRotationStatus(
                applicationDetail.application.application_status
              )
            },
            {
              label: "대기 순번",
              value: applicationDetail.application.waitlist_order
                ? applicationDetail.application.waitlist_order + "번"
                : "-"
            },
            {
              label: "행사 일시",
              value: applicationDetail.event
                ? window.App.formatters.formatDateTime(applicationDetail.event.eventDate)
                : "-"
            },
            {
              label: "장소",
              value: applicationDetail.event ? applicationDetail.event.location : "-"
            },
            {
              label: "가능 일정",
              value: applicationDetail.application.available_schedule || "-"
            },
            {
              label: "참석 가능 여부",
              value: applicationDetail.application.attendance_status || "-"
            },
            {
              label: "간단 소개",
              value: applicationDetail.application.short_intro || "-"
            },
            {
              label: "신청일",
              value: window.App.formatters.formatDateTime(
                applicationDetail.application.created_at
              )
            }
          ])
        )
      }),
      eventStat
        ? window.App.renderSection({
            title: "회차 현황",
            content: e(
              "div",
              { className: "info-grid" },
              e(
                "article",
                { className: "info-card" },
                e("strong", null, "확정 인원"),
                e(
                  "p",
                  null,
                  "남 " +
                    eventStat.maleConfirmed +
                    " / " +
                    eventStat.event.maleCapacity +
                    " · 여 " +
                    eventStat.femaleConfirmed +
                    " / " +
                    eventStat.event.femaleCapacity
                )
              ),
              e(
                "article",
                { className: "info-card" },
                e("strong", null, "총 신청"),
                e("p", null, eventStat.totalApplications + "건 접수"),
                e(
                  "p",
                  { className: "admin-list-sub" },
                  "확정, 대기열, 마감, 취소 상태를 모두 포함합니다."
                )
              ),
              e(
                "article",
                { className: "info-card" },
                e("strong", null, "대기 인원"),
                e(
                  "p",
                  null,
                  "남 " +
                    eventStat.maleWaitlisted +
                    " / " +
                    eventStat.event.maleWaitlistCapacity +
                    " · 여 " +
                    eventStat.femaleWaitlisted +
                    " / " +
                    eventStat.event.femaleWaitlistCapacity
                )
              )
            )
          })
        : null,
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
              ...window.App.text.formOptions.rotationApplicationStatuses.map(function (status) {
                return e(
                  "option",
                  { key: status, value: status },
                  window.App.formatters.formatRotationStatus(status)
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
              placeholder: "확정 사유, 대기 안내, 취소 메모를 기록합니다.",
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

  window.App.AdminRotationPanel = AdminRotationPanel;
})();
