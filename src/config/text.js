(function () {
  window.App = window.App || {};

  window.App.text = {
    brand: {
      name: "청춘캠퍼스",
      slogan: "캠퍼스를 청춘으로 채우자"
    },
    home: {
      hero: {
        eyebrow: "대학생 소개팅 서비스",
        title: "로테이션 소개팅과 1대1 소개팅을\n하나의 흐름으로 운영합니다.",
        description:
          "모바일에서 간편하게 신청하고, 일정 안내와 매칭 결과까지 자연스럽게 이어지는 대학생 소개팅 서비스입니다.",
        detail: "원하는 방식의 소개팅을 선택해 신청해 보세요."
      }
    },
    rotation: {
      highlights: [
        "회차별 남자 11명 / 여자 11명 정원 관리",
        "초과 신청 시 성별별 대기열 자동 분류",
        "행사형 서비스에 맞춘 일정·참석 여부 수집"
      ]
    },
    match: {
      principles: [
        "기본 조건을 먼저 확인해 어울리는 상대를 찾습니다.",
        "선호 스타일 1순위, 2순위, 3순위를 우선 반영합니다.",
        "부담 없이 자연스럽게 대화가 이어질 수 있는 연결을 우선합니다."
      ]
    },
    guide: {
      rules: [
        "신청 정보는 운영 목적에 한해 사용합니다.",
        "신청 내용 확인 후 순차적으로 진행 상태를 안내드립니다.",
        "최종 매칭 완료 전에는 상대방 상세 정보를 공개하지 않습니다.",
        "이상 행동이나 허위 정보가 확인되면 신청이 종료될 수 있습니다."
      ]
    },
    reviews: {
      notice:
        "이용 후기를 남기고 다른 이용자들의 경험도 함께 확인해 보세요."
    },
    admin: {
      loginTitle: "관리자 세션 로그인",
      localSetupHint:
        "현재 정적 빌드에서는 브라우저에 저장되는 관리자 세션 키로 운영합니다. 실제 배포에서는 서버 또는 Supabase Auth로 교체해야 합니다.",
      localLoginHint:
        "초기 설정한 관리자 세션 키를 입력하면 운영 화면에 접근할 수 있습니다."
    },
    rotationEvents: [
      {
        id: "rotation-2026-05-08",
        title: "5월 8일 금요일 로테이션 소개팅",
        eventDate: "2026-05-08T19:00:00+09:00",
        location: "신촌",
        maleCapacity: 11,
        femaleCapacity: 11,
        maleWaitlistCapacity: 5,
        femaleWaitlistCapacity: 5,
        status: "open"
      },
      {
        id: "rotation-2026-05-15",
        title: "5월 15일 금요일 로테이션 소개팅",
        eventDate: "2026-05-15T19:00:00+09:00",
        location: "건대입구",
        maleCapacity: 11,
        femaleCapacity: 11,
        maleWaitlistCapacity: 5,
        femaleWaitlistCapacity: 5,
        status: "open"
      }
    ],
    formOptions: {
      genders: [
        { value: "male", label: "남성" },
        { value: "female", label: "여성" }
      ],
      grades: ["1학년", "2학년", "3학년", "4학년", "휴학", "졸업유예"],
      drinking: ["안 함", "가끔", "자주"],
      smoking: ["비흡연", "흡연"],
      religion: ["무교", "기독교", "천주교", "불교", "기타"],
      styles: ["차분함", "활발함", "대화형", "유머형", "리더형", "배려형"],
      matchStatuses: [
        "submitted",
        "reviewing",
        "waiting_match",
        "candidate_found",
        "matched",
        "hold",
        "closed"
      ],
      rotationApplicationStatuses: ["confirmed", "waitlisted", "closed", "cancelled"]
    }
  };
})();
