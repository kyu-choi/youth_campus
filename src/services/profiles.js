(function () {
  window.App = window.App || {};

  function nowIso() {
    return new Date().toISOString();
  }

  function buildProfile(form) {
    const normalize = window.App.validators.normalize;
    const timestamp = nowIso();

    return {
      id: window.App.storeService.createId("profile"),
      name: normalize(form.name),
      gender: form.gender,
      age: Number(form.age),
      university: normalize(form.university),
      grade: normalize(form.grade),
      phone: normalize(form.phone),
      kakao_id: normalize(form.kakaoId),
      region: normalize(form.region),
      consent_personal_info: Boolean(form.consentPersonalInfo),
      created_at: timestamp,
      updated_at: timestamp
    };
  }

  window.App.profilesService = {
    buildProfile: buildProfile,
    nowIso: nowIso
  };
})();
