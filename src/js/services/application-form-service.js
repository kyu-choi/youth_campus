window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.services = window.CheongchunCampus.services || {};

window.CheongchunCampus.services.submitApplication =
  async function submitApplication(payload, filesByField = {}) {
    const { supabaseConfig } = window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client) {
      console.info("Supabase disabled. Application payload:", payload, filesByField);
      return { stored: false };
    }

    const payloadWithFiles = {
      ...payload,
      uploaded_files: await uploadApplicationFiles(
        client,
        supabaseConfig.applicationFilesBucket,
        payload,
        filesByField
      ),
    };

    const { error } = await client
      .from(supabaseConfig.applicationSubmissionsTable)
      .insert({
        payload: payloadWithFiles,
        name: payload.name,
        phone: payload.phone,
        applicant_name: payload.name,
        applicant_phone: payload.phone,
        kakao_id: payload.kakao_id,
        gender: payload.gender,
        birth_year: payload.birth_year ? Number(payload.birth_year) : null,
        region: payload.region,
        school: payload.school,
        major: payload.major,
        residence: payload.residence,
        job: payload.job,
        height: toNullableNumber(payload.height),
        weight: toNullableNumber(payload.weight),
        smoking: payload.smoking,
        program_type: payload.program_type,
        matching_status:
          payload.program_type === "1:1 카톡 소개팅" ? "unmatched" : null,
        preferred_date: payload.preferred_date,
        companion_name: payload.companion_name,
        preferred_age: payload.preferred_age,
        avoided_age: payload.avoided_age,
        avoided_person: payload.avoided_person,
        ideal_type: payload.ideal_type,
        self_intro: payload.self_intro,
        drink: payload.drink,
        drink_temperature: payload.drink_temperature,
        privacy_confirmed: Boolean(payload.privacy_confirmed),
        student_status_confirmed: Boolean(payload.student_status_confirmed),
        after_meeting_confirmed: Boolean(payload.after_meeting_confirmed),
        refund_confirmed: Boolean(payload.refund_confirmed),
        kakao_required_confirmed: Boolean(payload.kakao_required_confirmed),
        employment_files:
          payloadWithFiles.uploaded_files?.employment_file_names || [],
        profile_photos: payloadWithFiles.uploaded_files?.profile_photo_names || [],
      });

    if (error) {
      throw error;
    }

    return { stored: true };
  };

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getUploadPath(payload, fieldName, file) {
  const submittedAt = new Date().toISOString().replace(/[:.]/g, "-");
  const applicant = sanitizeFileName(payload.name || "unknown");
  const uniqueId =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const safeFileName = sanitizeFileName(file.name || "upload");

  return `${submittedAt}/${applicant}/${fieldName}/${uniqueId}-${safeFileName}`;
}

async function uploadApplicationFiles(client, bucket, payload, filesByField) {
  const uploadedFiles = {};

  for (const [fieldName, fieldFiles] of Object.entries(filesByField)) {
    const uploadedFieldFiles = [];

    for (const file of fieldFiles) {
      const path = getUploadPath(payload, fieldName, file);
      const { error } = await client.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        throw error;
      }

      uploadedFieldFiles.push({
        bucket,
        path,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    uploadedFiles[fieldName] = uploadedFieldFiles;
  }

  return uploadedFiles;
}
