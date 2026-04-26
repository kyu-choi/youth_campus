window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.config = window.CheongchunCampus.config || {};

window.CheongchunCampus.config.applicationForm = {
  title: "[이음 로테이션 소개팅 신청서]",
  description:
    "이음 로테이션 소개팅 신청을 위한 기본 정보와 선호 내용을 작성해주세요.",
  privacyText:
    "수집 항목: 이름, 연락처, 거주지, 직장, 사진 등 신청서에 기입된 사항. 목적: 소개팅 선정자 안내 및 신원 확인. 보유 기간: 신청일로부터 5년 후 폐기.",
  submitLabel: "신청완료",
  successTitle: "신청서 작성이 완료되었습니다",
  successMessage:
    "신청 내용은 전달되었습니다. 확정 후 개별 안내 문자로 자세한 장소를 알려드릴 예정입니다.",
  pages: [
    {
      eyebrow: "기본 정보",
      title: "본인 확인 정보를 입력해주세요.",
      fields: [
        {
          name: "name",
          label: "성함",
          type: "text",
          placeholder: "김이음",
          required: true,
        },
        {
          name: "birth_year",
          label: "태어난 년도",
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
          name: "privacy_confirmed",
          label: "개인정보 수집 및 이용 안내를 확인했습니다.",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      eyebrow: "참여 일정",
      title: "참여 희망 날짜를 선택해주세요.",
      fields: [
        {
          name: "preferred_date",
          label: "참여희망날짜",
          type: "choice",
          required: true,
          options: [
            "5월 10일 (일) 오후 2시",
            "5월 24일 (일) 오후 2시",
            "5월 10일 (일) 오후 7시",
            "5월 17일 (일) 오후 7시",
            "5월 8일 (금) 오후 8시",
            "5월 15일 (금) 오후 8시",
            "5월 17일 (일) 오후 2시",
          ],
        },
        {
          name: "participation_type",
          label: "재참여 여부",
          type: "choice",
          required: true,
          options: ["신규", "재참여"],
        },
        {
          name: "companion_name",
          label: "동반참여자 성함",
          type: "text",
          placeholder: "00년생 김이음",
        },
      ],
    },
    {
      eyebrow: "프로필",
      title: "매칭에 필요한 정보를 알려주세요.",
      fields: [
        {
          name: "residence",
          label: "거주지 (시/구)",
          type: "text",
          placeholder: "부산 / 금정구",
          required: true,
        },
        {
          name: "job",
          label: "현재 하고 계신 일",
          type: "text",
          placeholder: "00회사 사무직 / 00병원 간호사",
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
        {
          name: "religion",
          label: "종교",
          type: "choice",
          required: true,
          options: ["무교", "기독교", "천주교", "불교", "기타"],
        },
      ],
    },
    {
      eyebrow: "선호",
      title: "희망 조건과 피하고 싶은 상황을 적어주세요.",
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
          placeholder: "94년생 00회사 김이음",
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
          label: "재직 또는 재학 증빙 자료",
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
          name: "single_confirmed",
          label:
            "현재 미혼이며 과거 혼인 및 이혼 경력, 사실혼, 법적 혼인 관계에 해당되지 않음을 확인합니다.",
          type: "checkbox",
          required: true,
        },
        {
          name: "after_meeting_confirmed",
          label:
            "모임 이후 개인 연락, 만남, 재연결 요청 등에 대해 주최자가 관여하거나 책임지지 않음을 확인합니다.",
          type: "checkbox",
          required: true,
        },
        {
          name: "refund_confirmed",
          label:
            "환불 규정과 일정 변경 규정을 확인했습니다. 7일 전 100%, 6~4일 전 50%, 3일 전부터 당일은 환불 불가입니다.",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};
