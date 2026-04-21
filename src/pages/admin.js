(function () {
  window.App = window.App || {};
  const e = React.createElement;
  const useEffect = React.useEffect;
  const useState = React.useState;

  function LoginPanel(config) {
    const authState = window.App.adminService.getAuthState();
    const [accessKey, setAccessKey] = useState("");
    const [confirmAccessKey, setConfirmAccessKey] = useState("");
    const [error, setError] = useState("");

    if (authState.mode === "supabase_auth") {
      return window.App.renderSection({
        title: "관리자 인증 필요",
        description:
          "Supabase Auth 또는 서버 인증이 연결되어야 관리자 화면에 접근할 수 있습니다.",
        content: window.App.renderEmptyState("현재 빌드에서는 인증 공급자가 연결되어 있지 않습니다.")
      });
    }

    if (!authState.hasLocalAccessKey) {
      return window.App.renderSection({
        title: "관리자 세션 초기 설정",
        description: window.App.text.admin.localSetupHint,
        content: e(
          "form",
          {
            className: "stack-form",
            onSubmit: function (event) {
              event.preventDefault();

              if (
                window.App.validators.isBlank(accessKey) ||
                window.App.validators.isBlank(confirmAccessKey)
              ) {
                setError("세션 키를 모두 입력해 주세요.");
                return;
              }

              if (accessKey !== confirmAccessKey) {
                setError("세션 키가 서로 다릅니다.");
                return;
              }

              if (window.App.adminService.initializeLocalAccessKey(accessKey)) {
                setError("");
                config.onSuccess();
                return;
              }

              setError("세션 키를 저장할 수 없습니다.");
            }
          },
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "관리자 세션 키"),
            e("input", {
              className: "text-input",
              type: "password",
              value: accessKey,
              onChange: function (event) {
                setAccessKey(event.target.value);
              }
            })
          ),
          e(
            "label",
            { className: "field-block" },
            e("span", { className: "field-label" }, "세션 키 확인"),
            e("input", {
              className: "text-input",
              type: "password",
              value: confirmAccessKey,
              onChange: function (event) {
                setConfirmAccessKey(event.target.value);
              }
            }),
            error ? e("span", { className: "field-error" }, error) : null
          ),
          e("button", { className: "primary-button", type: "submit" }, "세션 키 저장 후 진입")
        )
      });
    }

    return window.App.renderSection({
      title: window.App.text.admin.loginTitle,
      description: window.App.text.admin.localLoginHint,
      content: e(
        "form",
        {
          className: "stack-form",
          onSubmit: function (event) {
            event.preventDefault();

            if (window.App.adminService.login(accessKey)) {
              setError("");
              config.onSuccess();
              return;
            }

            setError("세션 키가 올바르지 않습니다.");
          }
        },
        e(
          "label",
          { className: "field-block" },
          e("span", { className: "field-label" }, "관리자 세션 키"),
          e("input", {
            className: "text-input",
            type: "password",
            value: accessKey,
            onChange: function (event) {
              setAccessKey(event.target.value);
            }
          }),
          error ? e("span", { className: "field-error" }, error) : null
        ),
        e("button", { className: "primary-button", type: "submit" }, "로그인")
      )
    });
  }

  function AdminPage() {
    const [loggedIn, setLoggedIn] = useState(window.App.adminService.isLoggedIn());
    const [snapshot, setSnapshot] = useState(window.App.adminService.getDashboardSnapshot());
    const [activeSection, setActiveSection] = useState("rotation");
    const [selectedRotationApplicationId, setSelectedRotationApplicationId] = useState("");
    const [selectedMatchApplicationId, setSelectedMatchApplicationId] = useState("");
    const [rotationStatusFilter, setRotationStatusFilter] = useState("all");
    const [rotationEventFilter, setRotationEventFilter] = useState("all");
    const [rotationSearchKeyword, setRotationSearchKeyword] = useState("");
    const [matchStatusFilter, setMatchStatusFilter] = useState("all");
    const [matchSearchKeyword, setMatchSearchKeyword] = useState("");

    function refreshSnapshot() {
      setSnapshot(window.App.adminService.getDashboardSnapshot());
    }

    useEffect(
      function () {
        if (!snapshot.rotationApplications.length) {
          setSelectedRotationApplicationId("");
        } else {
          const exists = snapshot.rotationApplications.some(function (item) {
            return item.application.id === selectedRotationApplicationId;
          });

          if (!exists) {
            setSelectedRotationApplicationId(snapshot.rotationApplications[0].application.id);
          }
        }

        if (!snapshot.matchApplications.length) {
          setSelectedMatchApplicationId("");
        } else {
          const exists = snapshot.matchApplications.some(function (item) {
            return item.application.id === selectedMatchApplicationId;
          });

          if (!exists) {
            setSelectedMatchApplicationId(snapshot.matchApplications[0].application.id);
          }
        }
      },
      [snapshot, selectedRotationApplicationId, selectedMatchApplicationId]
    );

    if (!loggedIn) {
      return e(
        "div",
        { className: "page-stack" },
        e(
          "section",
          { className: "page-hero" },
          e("p", { className: "hero-eyebrow" }, "비공개 운영 페이지"),
          e("h1", { className: "hero-title" }, "관리자 페이지"),
          e(
            "p",
            { className: "hero-description" },
            "로테이션 신청 관리와 1대1 매칭 관리를 나누어 운영하는 전용 화면입니다."
          )
        ),
        e(LoginPanel, {
          onSuccess: function () {
            setLoggedIn(true);
            refreshSnapshot();
          }
        })
      );
    }

    const filteredRotationApplications = snapshot.rotationApplications.filter(function (item) {
      const matchesStatus =
        rotationStatusFilter === "all" ||
        item.application.application_status === rotationStatusFilter;
      const matchesEvent =
        rotationEventFilter === "all" || item.application.rotation_event_id === rotationEventFilter;
      const keyword = window.App.validators.normalize(rotationSearchKeyword).toLowerCase();
      const searchPool = [
        item.profile.name,
        item.profile.university,
        item.profile.region,
        item.event ? item.event.title : ""
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = keyword === "" || searchPool.includes(keyword);
      return matchesStatus && matchesEvent && matchesSearch;
    });

    const filteredMatchApplications = snapshot.matchApplications.filter(function (item) {
      const matchesStatus =
        matchStatusFilter === "all" || item.application.application_status === matchStatusFilter;
      const keyword = window.App.validators.normalize(matchSearchKeyword).toLowerCase();
      const searchPool = [
        item.profile.name,
        item.profile.university,
        item.profile.region,
        item.matchProfile.self_style
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = keyword === "" || searchPool.includes(keyword);
      return matchesStatus && matchesSearch;
    });

    const selectedRotationApplication = snapshot.rotationApplications.find(function (item) {
      return item.application.id === selectedRotationApplicationId;
    });
    const selectedRotationNotes = selectedRotationApplication
      ? window.App.adminService.listAdminNotes(
          "rotation_application",
          selectedRotationApplicationId
        )
      : [];
    const selectedRotationEventStat = selectedRotationApplication
      ? snapshot.rotationStats.find(function (item) {
          return item.event.id === selectedRotationApplication.application.rotation_event_id;
        })
      : null;

    const selectedMatchApplication = snapshot.matchApplications.find(function (item) {
      return item.application.id === selectedMatchApplicationId;
    });
    const selectedMatches = selectedMatchApplication
      ? window.App.matchingService.listMatchesForApplication(selectedMatchApplicationId)
      : [];
    const selectedMatchNotes = selectedMatchApplication
      ? window.App.adminService.listAdminNotes(
          "match_application",
          selectedMatchApplicationId
        )
      : [];
    const manualCandidates = selectedMatchApplication
      ? window.App.matchingService
          .getManualMatchCandidates(selectedMatchApplicationId)
          .filter(function (item) {
            return item.profile.gender !== selectedMatchApplication.profile.gender;
          })
      : [];

    function updateRotationStatus(nextStatus, note) {
      if (!selectedRotationApplication) {
        return;
      }

      window.App.rotationService.updateRotationApplicationStatus(
        selectedRotationApplication.application.id,
        nextStatus
      );

      if (window.App.validators.normalize(note)) {
        window.App.adminService.addAdminNote(
          "rotation_application",
          selectedRotationApplication.application.id,
          note,
          "status_update"
        );
      }

      refreshSnapshot();
    }

    function saveRotationNote(note) {
      if (!selectedRotationApplication || !window.App.validators.normalize(note)) {
        return;
      }

      window.App.adminService.addAdminNote(
        "rotation_application",
        selectedRotationApplication.application.id,
        note,
        "memo"
      );
      refreshSnapshot();
    }

    function updateMatchStatus(nextStatus, note) {
      if (!selectedMatchApplication) {
        return;
      }

      window.App.matchingService.updateApplicationStatus(
        selectedMatchApplication.application.id,
        nextStatus,
        note
      );

      if (window.App.validators.normalize(note)) {
        window.App.adminService.addAdminNote(
          "match_application",
          selectedMatchApplication.application.id,
          note,
          "status_update"
        );
      }

      refreshSnapshot();
    }

    function saveMatchNote(note) {
      if (!selectedMatchApplication || !window.App.validators.normalize(note)) {
        return;
      }

      window.App.adminService.addAdminNote(
        "match_application",
        selectedMatchApplication.application.id,
        note,
        "memo"
      );
      refreshSnapshot();
    }

    function runManualMatch(targetApplicationId, note) {
      if (!selectedMatchApplication || !targetApplicationId) {
        return;
      }

      try {
        window.App.matchingService.createManualMatch(
          selectedMatchApplication.application.id,
          targetApplicationId,
          note
        );
        refreshSnapshot();
      } catch (error) {
        window.alert(error.message);
      }
    }

    function runAutoMatch() {
      const created = window.App.matchingService.runAutoMatching();
      refreshSnapshot();
      window.alert(created.length + "개의 자동매칭 후보가 생성되었습니다.");
    }

    function approveMatch(matchId) {
      window.App.matchingService.updateMatchStatus(matchId, "approved");
      refreshSnapshot();
    }

    function completeMatch(matchId) {
      window.App.matchingService.updateMatchStatus(matchId, "completed");
      refreshSnapshot();
    }

    function cancelMatch(matchId) {
      window.App.matchingService.updateMatchStatus(matchId, "cancelled");
      refreshSnapshot();
    }

    return e(
      "div",
      { className: "page-stack" },
      e(
        "section",
        { className: "page-hero" },
        e("p", { className: "hero-eyebrow" }, "운영 전용"),
        e("h1", { className: "hero-title" }, "관리자 페이지"),
        e(
          "p",
          { className: "hero-description" },
          "로테이션 신청 관리와 1대1 매칭 관리를 나누어 운영하고, 1대1은 스타일 우선순위 기반 자동매칭과 수동매칭을 함께 처리합니다."
        ),
        e(
          "div",
          { className: "hero-action-row" },
          e(
            "button",
            {
              className: "primary-button",
              type: "button",
              onClick: runAutoMatch
            },
            "1대1 자동매칭 실행"
          ),
          e(
            "button",
            {
              className: "secondary-button",
              type: "button",
              onClick: function () {
                window.App.adminService.logout();
                setLoggedIn(false);
              }
            },
            "로그아웃"
          )
        )
      ),
      window.App.renderSection({
        title: "운영 현황",
        content: e(
          "div",
          { className: "info-grid" },
          e(
            "article",
            { className: "stat-card" },
            e("span", { className: "stat-label" }, "로테이션 신청"),
            e("strong", { className: "stat-value" }, snapshot.summary.totalRotationApplications)
          ),
          e(
            "article",
            { className: "stat-card" },
            e("span", { className: "stat-label" }, "1대1 신청"),
            e("strong", { className: "stat-value" }, snapshot.summary.totalMatchApplications)
          ),
          e(
            "article",
            { className: "stat-card" },
            e("span", { className: "stat-label" }, "자동 후보"),
            e("strong", { className: "stat-value" }, snapshot.summary.autoCandidates)
          ),
          e(
            "article",
            { className: "stat-card" },
            e("span", { className: "stat-label" }, "수동 후보"),
            e("strong", { className: "stat-value" }, snapshot.summary.manualCandidates)
          ),
          e(
            "article",
            { className: "stat-card" },
            e("span", { className: "stat-label" }, "완료 매칭"),
            e("strong", { className: "stat-value" }, snapshot.summary.completedMatches)
          )
        )
      }),
      window.App.renderSection({
        title: "운영 섹션",
        content: e(
          "div",
          { className: "tab-row" },
          e(
            "button",
            {
              className:
                activeSection === "rotation" ? "tab-button is-active" : "tab-button",
              type: "button",
              onClick: function () {
                setActiveSection("rotation");
              }
            },
            "로테이션 신청 관리"
          ),
          e(
            "button",
            {
              className: activeSection === "match" ? "tab-button is-active" : "tab-button",
              type: "button",
              onClick: function () {
                setActiveSection("match");
              }
            },
            "1대1 매칭 관리"
          )
        )
      }),
      activeSection === "rotation"
        ? e(
            "div",
            { className: "admin-layout" },
            window.App.renderSection({
              title: "로테이션 신청 목록",
              content: e(
                "div",
                { className: "stack-form" },
                e(
                  "div",
                  { className: "form-grid two-column" },
                  e(
                    "label",
                    { className: "field-block" },
                    e("span", { className: "field-label" }, "회차 필터"),
                    e(
                      "select",
                      {
                        className: "text-input",
                        value: rotationEventFilter,
                        onChange: function (event) {
                          setRotationEventFilter(event.target.value);
                        }
                      },
                      e("option", { value: "all" }, "전체 회차"),
                      ...window.App.text.rotationEvents.map(function (eventItem) {
                        return e(
                          "option",
                          { key: eventItem.id, value: eventItem.id },
                          eventItem.title
                        );
                      })
                    )
                  ),
                  e(
                    "label",
                    { className: "field-block" },
                    e("span", { className: "field-label" }, "상태 필터"),
                    e(
                      "select",
                      {
                        className: "text-input",
                        value: rotationStatusFilter,
                        onChange: function (event) {
                          setRotationStatusFilter(event.target.value);
                        }
                      },
                      e("option", { value: "all" }, "전체"),
                      ...window.App.text.formOptions.rotationApplicationStatuses.map(function (
                        status
                      ) {
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
                    { className: "field-block full-span" },
                    e("span", { className: "field-label" }, "검색"),
                    e("input", {
                      className: "text-input",
                      value: rotationSearchKeyword,
                      placeholder: "이름, 학교, 지역, 회차명",
                      onChange: function (event) {
                        setRotationSearchKeyword(event.target.value);
                      }
                    })
                  )
                ),
                e(window.App.AdminApplicationList, {
                  applications: filteredRotationApplications,
                  selectedApplicationId: selectedRotationApplicationId,
                  onSelect: setSelectedRotationApplicationId,
                  emptyMessage: "조건에 맞는 로테이션 신청이 없습니다.",
                  getId: function (item) {
                    return item.application.id;
                  },
                  getTitle: function (item) {
                    return item.profile.name;
                  },
                  getStatusLabel: function (item) {
                    return window.App.formatters.formatRotationStatus(
                      item.application.application_status
                    );
                  },
                  getStatusTone: function (item) {
                    return item.application.application_status;
                  },
                  getMeta: function (item) {
                    return [
                      item.event ? item.event.title : "회차 정보 없음",
                      window.App.formatters.formatGender(item.profile.gender),
                      item.profile.age + "세",
                      item.profile.university
                    ].join(" · ");
                  },
                  getSub: function (item) {
                    return (
                      "신청일 " +
                      window.App.formatters.formatDateTime(item.application.created_at)
                    );
                  }
                })
              )
            }),
            e(window.App.AdminRotationPanel, {
              applicationDetail: selectedRotationApplication,
              eventStat: selectedRotationEventStat,
              notes: selectedRotationNotes,
              onUpdateStatus: updateRotationStatus,
              onSaveNote: saveRotationNote
            })
          )
        : e(
            "div",
            { className: "admin-layout" },
            window.App.renderSection({
              title: "1대1 신청 목록",
              content: e(
                "div",
                { className: "stack-form" },
                e(
                  "div",
                  { className: "form-grid two-column" },
                  e(
                    "label",
                    { className: "field-block" },
                    e("span", { className: "field-label" }, "상태 필터"),
                    e(
                      "select",
                      {
                        className: "text-input",
                        value: matchStatusFilter,
                        onChange: function (event) {
                          setMatchStatusFilter(event.target.value);
                        }
                      },
                      e("option", { value: "all" }, "전체"),
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
                    e("span", { className: "field-label" }, "검색"),
                    e("input", {
                      className: "text-input",
                      value: matchSearchKeyword,
                      placeholder: "이름, 학교, 지역, 본인 스타일",
                      onChange: function (event) {
                        setMatchSearchKeyword(event.target.value);
                      }
                    })
                  )
                ),
                e(window.App.AdminApplicationList, {
                  applications: filteredMatchApplications,
                  selectedApplicationId: selectedMatchApplicationId,
                  onSelect: setSelectedMatchApplicationId,
                  emptyMessage: "조건에 맞는 1대1 신청이 없습니다.",
                  getId: function (item) {
                    return item.application.id;
                  },
                  getTitle: function (item) {
                    return item.profile.name;
                  },
                  getStatusLabel: function (item) {
                    return window.App.formatters.formatApplicationStatus(
                      item.application.application_status
                    );
                  },
                  getStatusTone: function (item) {
                    return item.application.application_status;
                  },
                  getMeta: function (item) {
                    return [
                      item.matchProfile.self_style || "스타일 미입력",
                      window.App.formatters.formatGender(item.profile.gender),
                      item.profile.age + "세",
                      item.profile.region
                    ].join(" · ");
                  },
                  getSub: function (item) {
                    return (
                      "신청일 " +
                      window.App.formatters.formatDateTime(item.application.created_at)
                    );
                  }
                })
              )
            }),
            e(window.App.AdminMatchPanel, {
              applicationDetail: selectedMatchApplication,
              matches: selectedMatches,
              notes: selectedMatchNotes,
              manualCandidates: manualCandidates,
              onUpdateStatus: updateMatchStatus,
              onSaveNote: saveMatchNote,
              onManualMatch: runManualMatch,
              onApproveMatch: approveMatch,
              onCompleteMatch: completeMatch,
              onCancelMatch: cancelMatch
            })
          )
    );
  }

  window.App.registerPage("admin", AdminPage);
})();
