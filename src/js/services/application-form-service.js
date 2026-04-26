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
        applicant_name: payload.name,
        applicant_phone: payload.phone,
        kakao_id: payload.kakao_id,
        gender: payload.gender,
        birth_year: payload.birth_year ? Number(payload.birth_year) : null,
        region: payload.region,
        school: payload.school,
        program_type: payload.program_type,
        participation_type: payload.participation_type,
        preferred_date: payload.preferred_date,
      });

    if (error) {
      throw error;
    }

    return { stored: true };
  };

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
