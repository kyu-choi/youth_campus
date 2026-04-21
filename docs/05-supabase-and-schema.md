# 내부 기획 05: Supabase 및 데이터 스키마

> 한줄 요약: 이 문서는 신청 데이터 저장 구조, 관리자 권한 모델, 자동매칭 계산 기준, 수동매칭 저장 방식까지 백엔드 관점에서 정의합니다.

이 문서는 내부 기술 기획 문서입니다.
Supabase를 기준으로 데이터 구조와 관리자 인증 방식을 정리합니다.

## 백엔드 선택
- Supabase 사용
- Postgres 기반 저장
- 기본 데이터 입력 환경은 휴대폰 모바일 브라우저 기반 프론트엔드
- 관리자 인증은 `커스텀 서버 세션` 또는 `Supabase Auth` 중 하나를 사용

## 인증 및 권한 원칙
- `admin.html`은 별도의 관리자 전용 진입 페이지로 유지
- 공용 페이지에서는 관리자 스크립트와 관리자 컴포넌트를 로드하지 않음
- 프론트엔드 코드와 설정 파일에 관리자 비밀번호를 하드코딩하지 않음
- 관리자 페이지는 `로테이션 신청 관리`와 `1대1 매칭 관리`를 분리해서 제공
- 관리자 전용 조회, 상태 변경, 자동매칭, 수동매칭은 서버 API 또는 Supabase Edge Functions를 통해 처리
- `service_role` 키와 관리자 시크릿은 클라이언트에 노출하지 않음
- 개인정보가 포함된 테이블에는 RLS를 적용

## 권장 인증 모델
- 커스텀 서버 인증을 사용할 경우:
  - 서버에서 관리자 로그인 처리
  - `HttpOnly` 세션 쿠키 사용
  - 관리자 허용 목록은 서버 측에서 관리
- Supabase Auth를 사용할 경우:
  - `auth.users`로 로그인 처리
  - 별도 `admin_roles` 테이블로 관리자 권한 식별
  - RLS 정책에서 관리자 권한을 확인

## 현재 필요한 테이블
- `profiles`
  공통 사용자 기본 정보 저장
- `rotation_events`
  로테이션 행사 회차 정보 저장
- `rotation_applications`
  로테이션 소개팅 신청 정보 저장
- `match_profiles`
  1대1 소개팅용 상세 프로필 저장
- `match_applications`
  1대1 소개팅 신청 단위 및 신청 상태 저장
- `matches`
  자동매칭/수동매칭 결과 저장
- `reviews`
  후기 데이터 저장
- `admin_notes`
  관리자 메모 저장
- `admin_roles`
  Supabase Auth 사용 시 관리자 권한 매핑 저장

## 핵심 구조 원칙
- 공통 프로필은 `profiles`
- 로테이션 신청 데이터는 `rotation_applications`
- 1대1 프로필 데이터는 `match_profiles`
- 1대1 신청 상태 데이터는 `match_applications`
- 자동매칭 및 수동매칭 결과는 `matches`
- 관리자 메모와 이력은 `admin_notes`
- 관리자 권한 판별은 `admin_roles` 또는 서버 허용 목록에서 처리

## 1대1 매칭 데이터 구조 원칙
- 신청 페이지에서 `본인 스타일`과 `선호 스타일 우선순위`를 함께 받음
- 자동매칭은 `상대의 본인 스타일`과 `내 선호 스타일 우선순위`의 일치도를 가장 먼저 계산
- 스타일 우선순위는 `1순위 > 2순위 > 3순위` 순서로 가중치를 다르게 둠
- 수동매칭 시에도 관리자가 같은 정보를 보고 직접 후보를 선택

## 자동매칭 초안
- 하드 조건 필터:
  나이, 지역, 흡연/음주, 종교
- 스타일 우선순위 점수:
  - 1순위 일치: 최고 가중치
  - 2순위 일치: 중간 가중치
  - 3순위 일치: 보조 가중치
- 보조 점수:
  키 선호, 자기소개 키워드, 일정 적합도
- 결과는 `matches` 테이블에 저장
- 최종 승인과 완료 처리는 인증된 관리자만 수행

## 관리자 페이지와 연결되는 매칭 구조
- 신청 페이지에서 저장된 데이터는 관리자 페이지에서 즉시 조회 가능해야 함
- `로테이션 신청 관리`에서는 회차별 신청 목록과 상태를 확인
- `1대1 매칭 관리`에서는 신청자 정보와 선호 스타일 우선순위를 확인
- 자동매칭 실행은 서버 측 로직에서 수행
- 관리자는 자동매칭 후보를 확인한 뒤 승인 또는 보류 처리 가능
- 필요 시 관리자가 직접 수동매칭을 생성 가능
- 최종 완료 전까지는 신청 상태와 매칭 상태를 별도로 관리
- 공용 페이지에서는 위 관리자 로직을 호출하지 않음

## 상태 관리 권장
- `match_applications.application_status`
  - `submitted`
  - `reviewing`
  - `waiting_match`
  - `candidate_found`
  - `matched`
  - `hold`
  - `closed`
- `matches.status`
  - `candidate`
  - `manual_candidate`
  - `approved`
  - `completed`
  - `cancelled`

## 권장 RLS 방향
- 일반 사용자는 `rotation_applications`, `match_applications`, `match_profiles`, `admin_notes`를 조회할 수 없음
- 일반 사용자는 본인 제출에 필요한 `insert`만 허용하거나 서버 API를 통해 우회 처리
- 후기는 승인된 데이터만 공개 조회 허용
- 관리자 조회와 상태 변경은 서버 또는 관리자 권한 세션으로만 허용

## 상세 요구 조건
- `rotation_applications.profile_id`, `match_profiles.profile_id`, `match_applications.profile_id`는 유효한 `profiles.id`를 참조하는 외래키로 유지해야 합니다.
- `match_profiles`의 `preferred_style_rank_1`, `preferred_style_rank_2`, `preferred_style_rank_3`는 중복되지 않도록 애플리케이션 레벨 또는 DB 제약으로 방지해야 합니다.
- `matches`에는 자동매칭과 수동매칭을 구분할 수 있도록 `match_type`, `style_priority_score`, `match_reason`, `reviewed_by`를 반드시 남겨야 합니다.
- 자동매칭 함수는 최소한 `하드 필터 통과 여부`, `스타일 우선순위 점수`, `보조 점수`, `최종 총점`을 기록해야 합니다.
- 수동매칭 생성 시에도 동일 쌍 중복 생성 방지 규칙을 두고, 이미 완료된 매칭과 충돌하는지 검사해야 합니다.
- 관리자 권한 검증은 `admin_roles` 또는 서버 측 허용 목록으로 일관되게 처리하고, 클라이언트 단 조건문만으로 보호하면 안 됩니다.
- 주요 관리자 액션은 감사 목적상 별도 로그 또는 `admin_notes`로 추적 가능해야 합니다.

## 구현 순서
1. Supabase 프로젝트 생성
2. 인증 방식 결정
   커스텀 서버 세션 또는 Supabase Auth 중 택1
3. RLS 정책 설계
4. 테이블 설계
5. 공용 페이지용 client 설정
6. 신청 데이터 저장 구조 연결
7. 관리자 전용 API 또는 Edge Functions 연결
8. `로테이션 신청 관리` 조회 구조 연결
9. `1대1 매칭 관리` 조회 구조 연결
10. 선호 스타일 우선순위 저장 구조 추가
11. 자동매칭 결과 구조 추가
12. 수동매칭 결과 구조 추가
13. `admin.html` 관리자 조회/상태 변경 구조 연결
