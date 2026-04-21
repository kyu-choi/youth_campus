(function () {
  window.App = window.App || {};

  function nowIso() {
    return window.App.profilesService.nowIso();
  }

  function getEventById(eventId) {
    return window.App.text.rotationEvents.find(function (event) {
      return event.id === eventId;
    });
  }

  function getProfileById(store, profileId) {
    return store.profiles.find(function (item) {
      return item.id === profileId;
    });
  }

  function countEventByGender(store, eventId, gender, status) {
    return store.rotationApplications.filter(function (application) {
      if (application.rotation_event_id !== eventId) {
        return false;
      }

      if (status && application.application_status !== status) {
        return false;
      }

      const profile = getProfileById(store, application.profile_id);
      return profile && profile.gender === gender;
    }).length;
  }

  function resolveApplicationStatus(store, event, gender) {
    const confirmedCount = countEventByGender(store, event.id, gender, "confirmed");
    const waitlistedCount = countEventByGender(store, event.id, gender, "waitlisted");
    const capacityKey = gender === "male" ? "maleCapacity" : "femaleCapacity";
    const waitlistKey =
      gender === "male" ? "maleWaitlistCapacity" : "femaleWaitlistCapacity";

    if (confirmedCount < event[capacityKey]) {
      return { status: "confirmed", waitlistOrder: null };
    }

    if (waitlistedCount < event[waitlistKey]) {
      return {
        status: "waitlisted",
        waitlistOrder: waitlistedCount + 1
      };
    }

    return { status: "closed", waitlistOrder: null };
  }

  function recalculateWaitlistOrders(store, eventId, gender) {
    const waitlisted = store.rotationApplications
      .filter(function (application) {
        if (
          application.rotation_event_id !== eventId ||
          application.application_status !== "waitlisted"
        ) {
          return false;
        }

        const profile = getProfileById(store, application.profile_id);
        return profile && profile.gender === gender;
      })
      .sort(function (left, right) {
        return new Date(left.created_at) - new Date(right.created_at);
      });

    waitlisted.forEach(function (application, index) {
      application.waitlist_order = index + 1;
      application.updated_at = nowIso();
    });

    store.rotationApplications.forEach(function (application) {
      const profile = getProfileById(store, application.profile_id);

      if (!profile || profile.gender !== gender || application.rotation_event_id !== eventId) {
        return;
      }

      if (application.application_status !== "waitlisted") {
        application.waitlist_order = null;
      }
    });
  }

  function getJoinedRotationApplication(store, application) {
    return {
      application: application,
      profile: getProfileById(store, application.profile_id),
      event: getEventById(application.rotation_event_id)
    };
  }

  function submitRotationApplication(form) {
    const profile = window.App.profilesService.buildProfile(form);
    const event = getEventById(form.rotationEventId);

    if (!event) {
      throw new Error("선택한 회차 정보를 찾을 수 없습니다.");
    }

    const normalize = window.App.validators.normalize;
    const timestamp = nowIso();
    let createdApplication = null;

    window.App.storeService.mutateStore(function (store) {
      const statusResult = resolveApplicationStatus(store, event, profile.gender);

      createdApplication = {
        id: window.App.storeService.createId("rotation-app"),
        profile_id: profile.id,
        rotation_event_id: event.id,
        available_schedule: normalize(form.availableSchedule),
        attendance_status: normalize(form.attendanceStatus),
        short_intro: normalize(form.shortIntro),
        application_status: statusResult.status,
        waitlist_order: statusResult.waitlistOrder,
        created_at: timestamp,
        updated_at: timestamp
      };

      store.profiles.unshift(profile);
      store.rotationApplications.unshift(createdApplication);
      return store;
    });

    return {
      profile: profile,
      application: createdApplication,
      event: event
    };
  }

  function listRotationApplications() {
    const store = window.App.storeService.readStore();

    return store.rotationApplications
      .map(function (application) {
        return getJoinedRotationApplication(store, application);
      })
      .sort(function (left, right) {
        return new Date(right.application.created_at) - new Date(left.application.created_at);
      });
  }

  function updateRotationApplicationStatus(applicationId, nextStatus) {
    window.App.storeService.mutateStore(function (store) {
      const record = store.rotationApplications.find(function (application) {
        return application.id === applicationId;
      });

      if (!record) {
        return store;
      }

      const profile = getProfileById(store, record.profile_id);

      record.application_status = nextStatus;
      record.updated_at = nowIso();
      record.waitlist_order = nextStatus === "waitlisted" ? record.waitlist_order : null;

      if (profile) {
        recalculateWaitlistOrders(store, record.rotation_event_id, profile.gender);
      }

      return store;
    });
  }

  function listEventStats() {
    const store = window.App.storeService.readStore();

    return window.App.text.rotationEvents.map(function (event) {
      return {
        event: event,
        totalApplications: store.rotationApplications.filter(function (application) {
          return application.rotation_event_id === event.id;
        }).length,
        maleConfirmed: countEventByGender(store, event.id, "male", "confirmed"),
        femaleConfirmed: countEventByGender(store, event.id, "female", "confirmed"),
        maleWaitlisted: countEventByGender(store, event.id, "male", "waitlisted"),
        femaleWaitlisted: countEventByGender(store, event.id, "female", "waitlisted")
      };
    });
  }

  window.App.rotationService = {
    getEventById: getEventById,
    submitRotationApplication: submitRotationApplication,
    listRotationApplications: listRotationApplications,
    updateRotationApplicationStatus: updateRotationApplicationStatus,
    listEventStats: listEventStats
  };
})();
