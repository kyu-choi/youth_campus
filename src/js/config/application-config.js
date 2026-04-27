window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.config = window.CheongchunCampus.config || {};

window.CheongchunCampus.config.applicationForm = {
  title: "[청춘 캠퍼스 로테이션 소개팅 신청서]",
  description:
    "청춘 캠퍼스 로테이션 소개팅 신청을 위한 기본 정보와 선호 내용을 작성해주세요.",
  privacyText:
    "수집 항목: 이름, 연락처, 거주지, 직장, 사진 등 신청서에 기입된 사항. 목적: 소개팅 선정자 안내 및 신원 확인. 보유 기간: 신청일로부터 5년 후 폐기.",
  submitLabel: "신청완료",
  successTitle: "신청서 작성이 완료되었습니다",
  successMessage:
    "신청 내용은 전달되었습니다. 확정 후 개별 안내 문자로 자세한 장소를 알려드릴 예정입니다.",
  pages: [
    {
      eyebrow: "기본 정보",
      title: "신청자 기본 정보를 입력해주세요.",
      fields: [
        {
          name: "name",
          label: "성함",
          type: "text",
          placeholder: "김청춘",
          required: true,
        },
        {
          name: "region",
          label: "신청 지역",
          type: "choice",
          required: true,
          options: ["대구"],
        },
        {
          name: "program_type",
          label: "신청 프로그램",
          type: "choice",
          required: true,
          options: ["다대다 로테이션 소개팅", "1:1 카톡 소개팅"],
        },
        {
          name: "birth_year",
          label: "출생년도",
          type: "number",
          placeholder: "1998",
          required: true,
        },
        {
          name: "phone",
          label: "연락처",
          type: "tel",
          placeholder: "010-1234-5678",
          required: true,
        },
        {
          name: "gender",
          label: "성별",
          type: "choice",
          required: true,
          options: ["남성", "여성"],
        },
        {
          name: "kakao_id",
          label: "카카오톡 ID",
          type: "text",
          placeholder: "카카오톡 ID를 입력해주세요.",
          required: true,
        },
        {
          name: "privacy_confirmed",
          label: "개인정보 수집 및 이용 안내를 확인했습니다.",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      eyebrow: "신청 유형",
      title: "희망 프로그램과 일정을 선택해주세요.",
      fields: [
        {
          name: "preferred_date",
          label: "참여희망날짜",
          type: "choice",
          required: true,
          options: [
            {
              value: "5월 2일 (토) 오후 3시",
              label: "5월 2일 (토) 오후 3시",
              badge: "(마감)",
              badgeTone: "danger",
            },
            "5월 9일 (토) 오후 3시",
          ],
        },
        {
          name: "participation_type",
          label: "신청유형",
          type: "choice",
          required: true,
          options: ["신규 신청", "재신청"],
        },
        {
          name: "companion_name",
          label: "지인 동반 신청자 성함",
          type: "text",
          placeholder: "친구와 함께 신청하는 경우에만 작성해주세요.",
        },
      ],
    },
    {
      eyebrow: "프로필",
      title: "학교와 프로필 정보를 알려주세요.",
      fields: [
        {
          name: "school",
          label: "학교명",
          type: "text",
          placeholder: "경북대",
          required: true,
        },
        {
          name: "major",
          label: "학과",
          type: "text",
          placeholder: "경영학과",
          required: true,
        },
        {
          name: "residence",
          label: "거주지 (시/구)",
          type: "text",
          placeholder: "부산 / 금정구",
          required: true,
        },
        {
          name: "job",
          label: "현재 상태",
          type: "text",
          placeholder: "재학 / 휴학 / 졸업예정 / 직장 병행 등",
          required: true,
        },
        {
          name: "height",
          label: "키",
          type: "number",
          placeholder: "170",
          required: true,
        },
        {
          name: "weight",
          label: "몸무게",
          type: "number",
          placeholder: "60",
          required: true,
        },
        {
          name: "smoking",
          label: "흡연여부",
          type: "choice",
          required: true,
          options: ["비흡연자에요", "전자담배를 피워요", "가끔 피워요", "매일 피워요"],
        },
      ],
    },
    {
      eyebrow: "선호",
      title: "매칭 선호 정보를 적어주세요.",
      fields: [
        {
          name: "preferred_age",
          label: "선호하는 연령대",
          type: "choice",
          required: true,
          options: ["연상이 좋아요", "연하가 좋아요", "동갑이 좋아요", "상관 없어요"],
        },
        {
          name: "avoided_age",
          label: "피하고 싶은 연령대",
          type: "text",
          placeholder: "빈칸으로 두셔도 됩니다.",
        },
        {
          name: "avoided_person",
          label: "마주치지 않고 싶은 지인",
          type: "textarea",
          placeholder: "경북대학교 김청춘",
        },
        {
          name: "ideal_type",
          label: "선호하는 이상형",
          type: "textarea",
          placeholder: "성격, 분위기, 가치관 등 자유롭게 적어주세요.",
        },
        {
          name: "self_intro",
          label: "간단한 자기소개",
          type: "textarea",
          placeholder: "매칭에 참고할 수 있는 본인의 장점이나 취향을 적어주세요.",
          required: true,
        },
      ],
    },
    {
      eyebrow: "당일 준비",
      title: "소개팅 당일 음료를 선택해주세요.",
      fields: [
        {
          name: "drink",
          label: "드시고 싶은 음료",
          type: "choice",
          required: true,
          options: ["아메리카노", "디카페인 아메리카노", "아이스티", "캐모마일", "둥글레차", "물"],
        },
        {
          name: "drink_temperature",
          label: "음료 핫/아이스",
          type: "choice",
          required: true,
          options: ["핫", "아이스"],
        },
        {
          name: "phone_confirm",
          label: "연락처(재확인)",
          type: "tel",
          placeholder: "010-1234-5678",
          required: true,
        },
      ],
    },
    {
      eyebrow: "첨부",
      title: "증빙 자료와 사진을 첨부해주세요.",
      fields: [
        {
          name: "employment_file_names",
          label: "학생증 또는 재학증명서",
          type: "file",
          required: true,
        },
        {
          name: "profile_photo_names",
          label: "얼굴 위주 사진 1장 / 상체까지 보이는 사진 1장",
          type: "file",
          required: true,
          multiple: true,
        },
      ],
    },
    {
      eyebrow: "동의",
      title: "마지막 동의 내용을 확인해주세요.",
      fields: [
        {
          name: "student_status_confirmed",
          label:
            "현재 대학(원)생이며, 재학 또는 휴학 상태임을 확인합니다. (졸업생 및 직장인은 해당 모임 대상이 아닙니다.)",
          type: "checkbox",
          required: true,
        },
        {
          name: "after_meeting_confirmed",
          label:
            "모임 이후 이루어지는 개인 연락, 추가 만남, 재연결 요청 등에 대해서는 주최 측이 관여하거나 책임지지 않음을 확인합니다.",
          type: "checkbox",
          required: true,
        },
        {
          name: "refund_confirmed",
          label:
            "환불 및 일정 변경 규정을 확인했습니다. 행사 7일 전까지는 100% 환불, 6~4일 전까지는 50% 환불 가능하며, 행사 3일 전부터 당일 취소는 환불이 불가합니다.",
          type: "checkbox",
          required: true,
        },
        {
          name: "kakao_required_confirmed",
          label:
            "신청서 제출 후, 청춘 캠퍼스 공식 카카오톡 채널로 지역 / 이름 / 학교 / 신청 유형을 보내야 최종 접수가 완료됨을 확인했습니다.",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};
