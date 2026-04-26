window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.services = window.CheongchunCampus.services || {};

window.CheongchunCampus.services.submitApplication =
  async function submitApplication(payload) {
    const { supabaseConfig } = window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client) {
      console.info("Supabase disabled. Application payload:", payload);
      return { stored: false };
    }

    const { error } = await client
      .from(supabaseConfig.applicationSubmissionsTable)
      .insert({
        payload,
        applicant_name: payload.name,
        applicant_phone: payload.phone,
        preferred_date: payload.preferred_date,
      });

    if (error) {
      throw error;
    }

    return { stored: true };
  };
