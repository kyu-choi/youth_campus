# 내부 기획 06: 파일 구조와 분리 기준

> 한줄 요약: 이 문서는 어떤 기능을 어떤 파일에 배치할지, 공용 코드와 관리자 코드를 어디까지 분리할지 결정하는 구조 기준서입니다.

이 문서는 내부 구현 기준 문서입니다.
코드를 너무 복잡하게 쪼개지 않기 위한 기준을 정리합니다.

## 분리 원칙
- 페이지가 다르면 파일 분리
- 저장 로직이 다르면 파일 분리
- 여러 곳에서 재사용될 때만 컴포넌트 분리
- 초기 버전은 얕고 단순한 폴더 구조 유지
- 공용 화면과 관리자 화면의 로드 범위를 명확히 분리
- 관리자 화면 안에서도 `로테이션 신청 관리`와 `1대1 매칭 관리`를 분리

## 피하고 싶은 구조
- 폴더 깊이가 너무 깊은 구조
- 버튼 하나마다 별도 파일 만드는 구조
- 수정 위치를 찾기 어려운 공통 폴더 남발
- 공용 페이지에서 관리자 코드까지 한 번에 로드하는 구조
- 로테이션 관리와 1대1 매칭 로직이 한 파일에 뒤섞인 구조

## 권장 구조

```text
project-root/
  index.html
  rotation.html
  rotation-apply.html
  match.html
  match-apply.html
  reviews.html
  guide.html
  admin.html
  styles.css
  README.md
  PROJECT_NOTES.md
  docs/
  src/
    config/
      text.js
      routes.js
      supabase.js
    pages/
      home.js
      rotation.js
      rotation-apply.js
      match.js
      match-apply.js
      reviews.js
      guide.js
      admin.js
    components/
      button-card.js
      rotation-form.js
      match-form.js
      admin-application-list.js
      admin-rotation-panel.js
      admin-match-panel.js
      review-form.js
      review-list.js
    services/
      profiles.js
      rotation.js
      matching.js
      admin.js
      reviews.js
    utils/
      validators.js
      formatters.js
```

## 로드 정책
- `index.html`, `rotation.html`, `rotation-apply.html`, `match.html`, `match-apply.html`, `reviews.html`, `guide.html`
  - 사용자용 페이지와 공용 컴포넌트만 로드
  - `src/pages/admin.js`
  - `src/components/admin-application-list.js`
  - `src/components/admin-rotation-panel.js`
  - `src/components/admin-match-panel.js`
  - `src/services/admin.js`
  위 항목은 포함하지 않음
- `admin.html`
  - 관리자 전용 진입점
  - 관리자 페이지, 관리자 컴포넌트, 관리자 서비스만 별도로 로드

## 관리자 화면 구성 메모
- `admin-rotation-panel.js`
  - 로테이션 신청 목록
  - 회차별 정원/대기열 관리
  - 확정/보류 처리
- `admin-match-panel.js`
  - 1대1 신청 목록
  - 신청자 상세와 선호 스타일 우선순위 표시
  - 자동매칭 실행
  - 수동매칭 실행

## 구현 메모
- 로테이션 소개팅과 1대1 소개팅은 페이지를 분리하되, 공통 로직은 필요한 범위에서만 재사용
- 페이지별 진입 파일 1개를 유지
- 컴포넌트는 꼭 필요한 것만 추가
- 관리자 인증은 프론트 비밀번호가 아니라 서버 또는 Supabase Auth 세션 기준으로 처리
- 자동매칭 로직은 `matching.js`에 두고 관리자 화면은 실행과 결과 표시만 담당
- 모바일 화면 수정이 잦을 수 있으므로 스타일/페이지 파일을 찾기 쉽게 유지

## 파일별 상세 요구 조건
- `rotation-form.js`는 로테이션 신청 입력과 검증만 담당하고, 관리자용 상태 변경 로직을 포함하지 않아야 합니다.
- `match-form.js`는 1대1 신청 입력, 선호 스타일 우선순위 선택, 제출 전 검증만 담당해야 합니다.
- `admin-rotation-panel.js`는 회차별 신청 목록, 정원 현황, 대기열 처리 UI를 책임집니다.
- `admin-match-panel.js`는 신청 상세 조회, 자동매칭 실행, 수동매칭 실행, 운영 메모, 상태 변경 UI를 책임집니다.
- `matching.js`는 점수 계산과 후보 생성 로직을 담당하고, DOM 렌더링 책임을 가져서는 안 됩니다.
- 공용 HTML과 관리자 HTML은 로드 스크립트 목록이 분리되어야 하며, 공용 화면에서 관리자 컴포넌트를 간접 참조하는 구조도 피해야 합니다.
