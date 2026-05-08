window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.services = window.CheongchunCampus.services || {};

window.CheongchunCampus.services.submitReview =
  async function submitReview(payload) {
    const { supabaseConfig } = window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client) {
      console.info("Supabase disabled. Review payload:", payload);
      return { stored: false };
    }

    const { error } = await client
      .from(supabaseConfig.reviewSubmissionsTable)
      .insert({
        payload,
        event_date: payload.event_date,
        reviewer_name: payload.name,
        invite_kakao_id: payload.invite_kakao_id,
        participant_gender: payload.participant_gender,
        participant_number: payload.participant_number,
        overall_satisfaction: payload.overall_satisfaction,
        traffic_source: payload.traffic_source,
        has_after_interest: payload.has_after_interest,
        first_choice: payload.first_choice,
        second_choice: payload.second_choice,
        third_choice: payload.third_choice,
        choice_reason: payload.choice_reason,
        good_points: payload.good_points,
        improvement_points: payload.improvement_points,
        next_participation: payload.next_participation,
        operation_consent: Boolean(payload.operation_consent),
        contact_share_consent: Boolean(payload.contact_share_consent),
        one_way_private_confirmed: Boolean(payload.one_way_private_confirmed),
      });

    if (error) {
      throw error;
    }

    return { stored: true };
  };

window.CheongchunCampus.services.getReviewEventDates =
  async function getReviewEventDates() {
    const { supabaseConfig } = window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from(supabaseConfig.reviewEventDatesView)
      .select("event_date")
      .order("event_date", { ascending: false });

    if (error) {
      throw error;
    }

    const dates = (data || []).map((row) => row.event_date).filter(Boolean);

    return Array.from(new Set(dates));
  };
