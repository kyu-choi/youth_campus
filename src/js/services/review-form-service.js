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

    const participantContext = await getReviewParticipantContext(client, payload);
    const enrichedPayload = {
      ...payload,
      ...participantContext.payload,
    };

    const { error } = await client
      .from(supabaseConfig.reviewSubmissionsTable)
      .insert({
        payload: enrichedPayload,
        date_id: payload.date_id || null,
        event_date: payload.event_date,
        reviewer_participant_id: participantContext.reviewer?.id || null,
        reviewer_submission_id: participantContext.reviewer?.submission_id || null,
        reviewer_name: participantContext.reviewer?.name || payload.name,
        reviewer_nickname: participantContext.reviewer?.nickname || null,
        invite_kakao_id:
          participantContext.reviewer?.kakao_id || payload.invite_kakao_id,
        participant_gender: payload.participant_gender,
        participant_number: payload.participant_number,
        overall_satisfaction: payload.overall_satisfaction,
        traffic_source: payload.traffic_source,
        has_after_interest: payload.has_after_interest,
        first_choice: payload.first_choice,
        first_choice_participant_id: participantContext.choices.first?.id || null,
        first_choice_name: participantContext.choices.first?.name || null,
        first_choice_nickname: participantContext.choices.first?.nickname || null,
        first_choice_kakao_id: participantContext.choices.first?.kakao_id || null,
        second_choice: payload.second_choice,
        second_choice_participant_id: participantContext.choices.second?.id || null,
        second_choice_name: participantContext.choices.second?.name || null,
        second_choice_nickname: participantContext.choices.second?.nickname || null,
        second_choice_kakao_id: participantContext.choices.second?.kakao_id || null,
        third_choice: payload.third_choice,
        third_choice_participant_id: participantContext.choices.third?.id || null,
        third_choice_name: participantContext.choices.third?.name || null,
        third_choice_nickname: participantContext.choices.third?.nickname || null,
        third_choice_kakao_id: participantContext.choices.third?.kakao_id || null,
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
      .select("id,event_date,title,display_order")
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    const dates = (data || []).filter((row) => row.event_date);

    return dates.map((date) => ({
      value: date.event_date,
      label: date.title || date.event_date,
      date_id: date.id,
    }));
  };

window.CheongchunCampus.services.getReviewParticipants =
  async function getReviewParticipants(dateId) {
    const { supabaseConfig } = window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client || !dateId) {
      return [];
    }

    const { data, error } = await client
      .from("event_participant_public")
      .select("id,date_id,submission_id,participant_number,nickname,name,kakao_id,gender")
      .eq("date_id", dateId)
      .order("participant_number", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || [])
      .filter((participant) => participant.participant_number)
      .map(normalizeParticipant);
  };

async function getReviewParticipantContext(client, payload) {
  const participants = await window.CheongchunCampus.services.getReviewParticipants(
    payload.date_id
  );
  const participantMap = participants.reduce((map, participant) => {
    map.set(normalizeNumber(participant.participant_number), participant);
    return map;
  }, new Map());
  const reviewer = participantMap.get(normalizeNumber(payload.participant_number));
  const choices = {
    first: participantMap.get(normalizeNumber(payload.first_choice)),
    second: participantMap.get(normalizeNumber(payload.second_choice)),
    third: participantMap.get(normalizeNumber(payload.third_choice)),
  };

  return {
    reviewer,
    choices,
    payload: {
      reviewer_participant: reviewer || null,
      first_choice_participant: choices.first || null,
      second_choice_participant: choices.second || null,
      third_choice_participant: choices.third || null,
    },
  };
}

function normalizeParticipant(participant) {
  return {
    id: participant.id,
    submission_id: participant.submission_id,
    participant_number: participant.participant_number || "",
    nickname: participant.nickname || "",
    name: participant.name || "",
    kakao_id: participant.kakao_id || "",
    gender: participant.gender || "",
  };
}

function normalizeNumber(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
