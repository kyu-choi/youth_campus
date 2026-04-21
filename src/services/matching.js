(function () {
  window.App = window.App || {};

  const MIN_AUTO_MATCH_SCORE = 60;

  function normalize(value) {
    return window.App.validators.normalize(value);
  }

  function nowIso() {
    return window.App.profilesService.nowIso();
  }

  function buildMatchProfile(form, profileId) {
    const timestamp = nowIso();

    return {
      id: window.App.storeService.createId("match-profile"),
      profile_id: profileId,
      height: Number(form.height),
      self_style: normalize(form.selfStyle),
      preferred_age_min: Number(form.preferredAgeMin),
      preferred_age_max: Number(form.preferredAgeMax),
      preferred_height_min: Number(form.preferredHeightMin),
      preferred_height_max: Number(form.preferredHeightMax),
      preferred_style_rank_1: normalize(form.preferredStyleRank1),
      preferred_style_rank_2: normalize(form.preferredStyleRank2),
      preferred_style_rank_3: normalize(form.preferredStyleRank3),
      drinking: normalize(form.drinking),
      smoking: normalize(form.smoking),
      religion: normalize(form.religion),
      available_schedule: normalize(form.availableSchedule),
      intro: normalize(form.intro),
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  function buildMatchApplication(profileId) {
    const timestamp = nowIso();

    return {
      id: window.App.storeService.createId("match-app"),
      profile_id: profileId,
      application_status: "submitted",
      submitted_at: timestamp,
      review_started_at: "",
      last_matching_at: "",
      matched_at: "",
      closed_at: "",
      admin_note: "",
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  function submitMatchApplication(form) {
    const profile = window.App.profilesService.buildProfile(form);
    const matchProfile = buildMatchProfile(form, profile.id);
    const matchApplication = buildMatchApplication(profile.id);

    window.App.storeService.mutateStore(function (store) {
      store.profiles.unshift(profile);
      store.matchProfiles.unshift(matchProfile);
      store.matchApplications.unshift(matchApplication);
      return store;
    });

    return {
      profile: profile,
      matchProfile: matchProfile,
      matchApplication: matchApplication
    };
  }

  function getJoinedApplication(store, application) {
    const profile = store.profiles.find(function (item) {
      return item.id === application.profile_id;
    });
    const matchProfile = store.matchProfiles.find(function (item) {
      return item.profile_id === application.profile_id;
    });
    const matches = store.matches.filter(function (match) {
      return (
        match.match_application_id_1 === application.id ||
        match.match_application_id_2 === application.id
      );
    });

    return {
      application: application,
      profile: profile,
      matchProfile: matchProfile,
      matches: matches
    };
  }

  function listMatchApplications() {
    const store = window.App.storeService.readStore();

    return store.matchApplications
      .map(function (application) {
        return getJoinedApplication(store, application);
      })
      .sort(function (left, right) {
        return new Date(right.application.created_at) - new Date(left.application.created_at);
      });
  }

  function listMatches() {
    const store = window.App.storeService.readStore();

    return store.matches
      .map(function (match) {
        const application1 = store.matchApplications.find(function (item) {
          return item.id === match.match_application_id_1;
        });
        const application2 = store.matchApplications.find(function (item) {
          return item.id === match.match_application_id_2;
        });

        return {
          match: match,
          application1: application1 ? getJoinedApplication(store, application1) : null,
          application2: application2 ? getJoinedApplication(store, application2) : null
        };
      })
      .sort(function (left, right) {
        return new Date(right.match.created_at) - new Date(left.match.created_at);
      });
  }

  function isBlockingMatchStatus(status) {
    return ["candidate", "manual_candidate", "approved", "completed"].includes(status);
  }

  function hasOpenMatch(store, applicationId) {
    return store.matches.some(function (match) {
      const isSameApplication =
        match.match_application_id_1 === applicationId ||
        match.match_application_id_2 === applicationId;

      return isSameApplication && isBlockingMatchStatus(match.status);
    });
  }

  function sameRegion(left, right) {
    return normalize(left.profile.region) !== "" && left.profile.region === right.profile.region;
  }

  function inRange(value, minValue, maxValue) {
    if (!value) {
      return false;
    }

    if (!minValue || !maxValue) {
      return true;
    }

    return Number(value) >= Number(minValue) && Number(value) <= Number(maxValue);
  }

  function tokenize(value) {
    return normalize(value)
      .split(/[\s,]+/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function intersectionCount(left, right) {
    const rightSet = new Set(right);

    return left.filter(function (item) {
      return rightSet.has(item);
    }).length;
  }

  function getStyleRanks(matchProfile) {
    return [
      normalize(matchProfile.preferred_style_rank_1),
      normalize(matchProfile.preferred_style_rank_2),
      normalize(matchProfile.preferred_style_rank_3)
    ].filter(Boolean);
  }

  function getStylePriorityScore(preferredProfile, candidateProfile) {
    const ranks = getStyleRanks(preferredProfile);
    const selfStyle = normalize(candidateProfile.self_style);

    if (!selfStyle || ranks.length === 0) {
      return { score: 0, reason: "" };
    }

    if (ranks[0] && ranks[0] === selfStyle) {
      return { score: 24, reason: "1순위 스타일 일치" };
    }

    if (ranks[1] && ranks[1] === selfStyle) {
      return { score: 16, reason: "2순위 스타일 일치" };
    }

    if (ranks[2] && ranks[2] === selfStyle) {
      return { score: 8, reason: "3순위 스타일 일치" };
    }

    return { score: 0, reason: "" };
  }

  function scorePair(left, right) {
    if (!left.profile || !right.profile || !left.matchProfile || !right.matchProfile) {
      return { valid: false, score: 0, stylePriorityScore: 0, reason: "프로필 정보가 부족합니다." };
    }

    if (left.profile.gender === right.profile.gender) {
      return { valid: false, score: 0, stylePriorityScore: 0, reason: "동일 성별은 매칭할 수 없습니다." };
    }

    if (
      !inRange(
        right.profile.age,
        left.matchProfile.preferred_age_min,
        left.matchProfile.preferred_age_max
      ) ||
      !inRange(
        left.profile.age,
        right.matchProfile.preferred_age_min,
        right.matchProfile.preferred_age_max
      )
    ) {
      return {
        valid: false,
        score: 0,
        stylePriorityScore: 0,
        reason: "서로의 선호 나이 범위를 벗어났습니다."
      };
    }

    if (
      normalize(left.profile.region) &&
      normalize(right.profile.region) &&
      left.profile.region !== right.profile.region
    ) {
      return {
        valid: false,
        score: 0,
        stylePriorityScore: 0,
        reason: "활동 지역이 다릅니다."
      };
    }

    if (
      normalize(left.matchProfile.smoking) &&
      normalize(right.matchProfile.smoking) &&
      left.matchProfile.smoking !== right.matchProfile.smoking
    ) {
      return {
        valid: false,
        score: 0,
        stylePriorityScore: 0,
        reason: "흡연 조건이 맞지 않습니다."
      };
    }

    if (
      normalize(left.matchProfile.religion) &&
      normalize(right.matchProfile.religion) &&
      left.matchProfile.religion !== right.matchProfile.religion
    ) {
      return {
        valid: false,
        score: 0,
        stylePriorityScore: 0,
        reason: "종교 조건이 맞지 않습니다."
      };
    }

    let score = 40;
    let stylePriorityScore = 0;
    const reasons = ["상호 나이 조건 충족"];

    const leftStyleScore = getStylePriorityScore(left.matchProfile, right.matchProfile);
    const rightStyleScore = getStylePriorityScore(right.matchProfile, left.matchProfile);

    stylePriorityScore += leftStyleScore.score + rightStyleScore.score;
    score += stylePriorityScore;

    if (leftStyleScore.reason) {
      reasons.push("상대가 내 선호 " + leftStyleScore.reason);
    }

    if (rightStyleScore.reason) {
      reasons.push("내가 상대의 선호 " + rightStyleScore.reason);
    }

    if (
      inRange(
        right.matchProfile.height,
        left.matchProfile.preferred_height_min,
        left.matchProfile.preferred_height_max
      ) ||
      inRange(
        left.matchProfile.height,
        right.matchProfile.preferred_height_min,
        right.matchProfile.preferred_height_max
      )
    ) {
      score += 8;
      reasons.push("키 선호 조건 일부 충족");
    }

    if (sameRegion(left, right)) {
      score += 8;
      reasons.push("같은 지역 활동");
    }

    if (left.matchProfile.drinking === right.matchProfile.drinking) {
      score += 5;
      reasons.push("음주 성향 유사");
    }

    const introOverlap =
      intersectionCount(tokenize(left.matchProfile.intro), tokenize(right.matchProfile.intro));

    if (introOverlap > 0) {
      score += Math.min(6, introOverlap * 2);
      reasons.push("자기소개 키워드 유사");
    }

    const scheduleOverlap = intersectionCount(
      tokenize(left.matchProfile.available_schedule),
      tokenize(right.matchProfile.available_schedule)
    );

    if (scheduleOverlap > 0) {
      score += Math.min(9, scheduleOverlap * 3);
      reasons.push("가능 일정 겹침");
    }

    return {
      valid: true,
      score: Math.min(100, score),
      stylePriorityScore: stylePriorityScore,
      reason: reasons.join(", ")
    };
  }

  function createMatchRecord(options) {
    const timestamp = nowIso();

    return {
      id: window.App.storeService.createId("match"),
      match_application_id_1: options.applicationId1,
      match_application_id_2: options.applicationId2,
      profile_id_1: options.profileId1,
      profile_id_2: options.profileId2,
      match_type: options.matchType,
      style_priority_score: options.stylePriorityScore || 0,
      match_score: options.matchScore,
      match_reason: options.matchReason,
      status: options.status,
      reviewed_by: options.reviewedBy || "system",
      reviewed_at: options.reviewedAt || "",
      completed_at: "",
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  function updateApplicationAfterCandidate(application) {
    const timestamp = nowIso();

    application.application_status = "candidate_found";
    application.last_matching_at = timestamp;
    application.updated_at = timestamp;
  }

  function runAutoMatching() {
    let createdMatches = [];

    window.App.storeService.mutateStore(function (store) {
      const allApplications = store.matchApplications.map(function (application) {
        return getJoinedApplication(store, application);
      });
      const availableApplications = allApplications.filter(function (detail) {
        const status = detail.application.application_status;
        return (
          detail.profile &&
          detail.matchProfile &&
          !["matched", "closed", "hold"].includes(status) &&
          !hasOpenMatch(store, detail.application.id)
        );
      });
      const maleApplications = availableApplications.filter(function (detail) {
        return detail.profile.gender === "male";
      });
      const femaleApplications = availableApplications.filter(function (detail) {
        return detail.profile.gender === "female";
      });
      const usedFemaleApplicationIds = new Set();

      createdMatches = [];

      maleApplications.forEach(function (maleApplication) {
        let bestCandidate = null;

        femaleApplications.forEach(function (femaleApplication) {
          if (usedFemaleApplicationIds.has(femaleApplication.application.id)) {
            return;
          }

          const scored = scorePair(maleApplication, femaleApplication);

          if (!scored.valid || scored.score < MIN_AUTO_MATCH_SCORE) {
            return;
          }

          if (
            !bestCandidate ||
            scored.score > bestCandidate.score ||
            (scored.score === bestCandidate.score &&
              scored.stylePriorityScore > bestCandidate.stylePriorityScore)
          ) {
            bestCandidate = {
              target: femaleApplication,
              score: scored.score,
              stylePriorityScore: scored.stylePriorityScore,
              reason: scored.reason
            };
          }
        });

        if (!bestCandidate) {
          return;
        }

        usedFemaleApplicationIds.add(bestCandidate.target.application.id);

        const record = createMatchRecord({
          applicationId1: maleApplication.application.id,
          applicationId2: bestCandidate.target.application.id,
          profileId1: maleApplication.profile.id,
          profileId2: bestCandidate.target.profile.id,
          matchType: "auto",
          stylePriorityScore: bestCandidate.stylePriorityScore,
          matchScore: bestCandidate.score,
          matchReason: bestCandidate.reason,
          status: "candidate",
          reviewedBy: "system"
        });

        store.matches.unshift(record);
        updateApplicationAfterCandidate(maleApplication.application);
        updateApplicationAfterCandidate(bestCandidate.target.application);
        createdMatches.push(record);
      });

      return store;
    });

    return createdMatches;
  }

  function createManualMatch(primaryApplicationId, targetApplicationId, note) {
    const applications = listMatchApplications();
    const primaryApplication = applications.find(function (item) {
      return item.application.id === primaryApplicationId;
    });
    const targetApplication = applications.find(function (item) {
      return item.application.id === targetApplicationId;
    });

    if (!primaryApplication || !targetApplication) {
      throw new Error("매칭 대상 신청 정보를 찾을 수 없습니다.");
    }

    if (primaryApplication.profile.gender === targetApplication.profile.gender) {
      throw new Error("동일 성별은 수동매칭할 수 없습니다.");
    }

    const store = window.App.storeService.readStore();

    if (hasOpenMatch(store, primaryApplicationId) || hasOpenMatch(store, targetApplicationId)) {
      throw new Error("기존 후보가 남아 있습니다. 기존 후보를 먼저 취소한 뒤 다시 시도해 주세요.");
    }

    const scored = scorePair(primaryApplication, targetApplication);
    const score = scored.valid ? scored.score : 45;
    const stylePriorityScore = scored.valid ? scored.stylePriorityScore : 0;
    const reason = normalize(note) || scored.reason || "관리자 수동매칭";
    let createdMatch = null;

    window.App.storeService.mutateStore(function (nextStore) {
      const primaryRecord = nextStore.matchApplications.find(function (application) {
        return application.id === primaryApplicationId;
      });
      const targetRecord = nextStore.matchApplications.find(function (application) {
        return application.id === targetApplicationId;
      });

      if (!primaryRecord || !targetRecord) {
        return nextStore;
      }

      createdMatch = createMatchRecord({
        applicationId1: primaryApplicationId,
        applicationId2: targetApplicationId,
        profileId1: primaryApplication.profile.id,
        profileId2: targetApplication.profile.id,
        matchType: "manual",
        stylePriorityScore: stylePriorityScore,
        matchScore: score,
        matchReason: reason,
        status: "manual_candidate",
        reviewedBy: "admin"
      });

      nextStore.matches.unshift(createdMatch);
      updateApplicationAfterCandidate(primaryRecord);
      updateApplicationAfterCandidate(targetRecord);
      return nextStore;
    });

    return createdMatch;
  }

  function updateApplicationStatus(applicationId, status, note) {
    window.App.storeService.mutateStore(function (store) {
      const record = store.matchApplications.find(function (application) {
        return application.id === applicationId;
      });

      if (!record) {
        return store;
      }

      record.application_status = status;
      record.admin_note = normalize(note || record.admin_note);
      record.updated_at = nowIso();

      if (status === "reviewing" && !record.review_started_at) {
        record.review_started_at = nowIso();
      }

      if (status === "matched") {
        record.matched_at = nowIso();
      }

      if (status === "closed") {
        record.closed_at = nowIso();
      }

      return store;
    });
  }

  function updateMatchStatus(matchId, status) {
    window.App.storeService.mutateStore(function (store) {
      const match = store.matches.find(function (item) {
        return item.id === matchId;
      });

      if (!match) {
        return store;
      }

      if (
        ["completed", "cancelled"].includes(match.status) &&
        match.status !== status
      ) {
        return store;
      }

      match.status = status;
      match.updated_at = nowIso();

      if (status === "approved") {
        match.reviewed_at = nowIso();
        match.reviewed_by = "admin";
      }

      if (status === "completed") {
        match.completed_at = nowIso();

        [match.match_application_id_1, match.match_application_id_2].forEach(function (
          applicationId
        ) {
          const record = store.matchApplications.find(function (application) {
            return application.id === applicationId;
          });

          if (record) {
            record.application_status = "matched";
            record.matched_at = nowIso();
            record.updated_at = nowIso();
          }
        });
      }

      if (status === "cancelled") {
        [match.match_application_id_1, match.match_application_id_2].forEach(function (
          applicationId
        ) {
          const hasRemainingOpenMatch = store.matches.some(function (item) {
            if (item.id === match.id || !isBlockingMatchStatus(item.status)) {
              return false;
            }

            return (
              item.match_application_id_1 === applicationId ||
              item.match_application_id_2 === applicationId
            );
          });
          const record = store.matchApplications.find(function (application) {
            return application.id === applicationId;
          });

          if (record && !hasRemainingOpenMatch) {
            record.application_status = "waiting_match";
            record.updated_at = nowIso();
          }
        });
      }

      return store;
    });
  }

  function listMatchesForApplication(applicationId) {
    return listMatches().filter(function (item) {
      return (
        item.match.match_application_id_1 === applicationId ||
        item.match.match_application_id_2 === applicationId
      );
    });
  }

  function getManualMatchCandidates(applicationId) {
    const store = window.App.storeService.readStore();

    return listMatchApplications().filter(function (item) {
      if (item.application.id === applicationId) {
        return false;
      }

      return (
        !["matched", "closed", "hold"].includes(item.application.application_status) &&
        !hasOpenMatch(store, item.application.id)
      );
    });
  }

  window.App.matchingService = {
    submitMatchApplication: submitMatchApplication,
    listMatchApplications: listMatchApplications,
    listMatches: listMatches,
    listMatchesForApplication: listMatchesForApplication,
    getManualMatchCandidates: getManualMatchCandidates,
    runAutoMatching: runAutoMatching,
    createManualMatch: createManualMatch,
    updateApplicationStatus: updateApplicationStatus,
    updateMatchStatus: updateMatchStatus,
    scorePair: scorePair
  };
})();
