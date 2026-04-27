# Supabase 구조 안내

향후 Supabase CLI를 붙일 때 기본적으로 확장할 위치를 미리 분리해 둔 폴더입니다.

## 폴더 용도

- `migrations/`: 테이블 생성, 인덱스, 시드용 SQL 마이그레이션
- `functions/`: Edge Functions 또는 서버 측 비즈니스 로직

## 프론트 연결 위치

- 브라우저 쪽 설정: `src/js/config/supabase-config.js`
- 브라우저 쪽 조회 로직: `src/js/services/campus-content-service.js`

## 추천 데이터 모델

- `landing_content`
  - `hero_title`
  - `hero_subtitle`
  - `instagram_label`
  - `instagram_badge`
  - `instagram_url`
  - `contact_prefix`
  - `contact_link_label`
  - `contact_url`
  - `contact_suffix`
  - `is_active`
- `landing_links`
  - `id`
  - `label`
  - `url`
  - `sort_order`
  - `is_active`
- `application_submissions`
  - 신청자 입력 정보 전체를 실제 컬럼으로 저장하는 메인 테이블
  - 관리자 웹페이지도 이 테이블만 읽고 수정
  - `name`
  - `phone`
  - `phone_confirm`
  - `applicant_name`
  - `applicant_phone`
  - `kakao_id`
  - `gender`
  - `birth_year`
  - `region`
  - `school`
  - `major`
  - `residence`
  - `job`
  - `height`
  - `weight`
  - `smoking`
  - `program_type`
  - `participation_type`
  - `preferred_date`
  - `companion_name`
  - `preferred_age`
  - `avoided_age`
  - `avoided_person`
  - `ideal_type`
  - `self_intro`
  - `drink`
  - `drink_temperature`
  - `employment_files`
  - `profile_photos`
  - `payload` (기존 데이터 호환/백업용 JSON)
  - `status` (`new`, `reviewed`, `matched`, `rejected`, `cancelled`)
  - `payment_status` (`unpaid`, `deposit_paid`, `paid`, `refunded`, `waived`)
  - `matching_status` (`unmatched`, `candidate`, `matched`, `notified`, `cancelled`)
  - `match_group`
  - `matched_with`
  - `score`
  - `admin_note`
  - `created_at`

현재 필요한 SQL은 아래 순서입니다.

1. `migrations/202604260001_application_submissions.sql`
   - 신청 데이터 테이블과 파일 업로드 버킷 생성
2. `migrations/202604270005_simplify_application_submissions.sql`
   - 신청서 입력 항목을 모두 `application_submissions` 실제 컬럼으로 추가
3. `migrations/202604270003_admin_access_policies.sql`
   - 관리자 로그인 이메일 테이블, 관리자 확인 함수, RLS 정책 생성
4. `migrations/202604270006_drop_unused_admin_views.sql`
   - 예전에 만든 View와 별도 매칭 테이블이 있다면 삭제
5. `migrations/202604270007_update_application_content.sql`
   - 카카오톡 채널 URL과 기존 5월 2일 일정 값을 최신 내용으로 보정

새 Supabase 프로젝트라면 4번은 실행해도 되고 생략해도 됩니다.
이미 예전 SQL을 실행해서 View나 `application_matches`가 보인다면 4번을 실행하면 정리됩니다.

첨부 파일은 `application-files` Storage bucket에 저장하고, 각 파일의 bucket/path/name/size/type은
`application_submissions.employment_files`, `application_submissions.profile_photos`에 저장합니다.
`payload.uploaded_files`는 기존 데이터 호환용으로만 남깁니다.

## 신청자 관리 흐름

1. 웹 신청서는 `application_submissions`의 실제 컬럼에 저장됩니다.
2. 관리자 웹페이지는 `application_submissions`만 읽어서 목록, 상세, 요약을 표시합니다.
3. 검토가 끝난 신청자는 `application_submissions.status`를 `reviewed`로 바꾸고, 필요하면 `score`, `admin_note`를 채웁니다.
4. 매칭 확정 시 남녀 신청자 양쪽의 `matching_status`, `match_group`, `matched_with`를 업데이트합니다.

## 관리자 웹페이지

`admin.html`을 열면 Supabase Dashboard에 들어가지 않고도 신청자 확인, 검토 상태 변경, 메모 저장, 남녀 1:1 매칭 저장을 할 수 있습니다.
관리자 웹페이지는 단순화 이후 `application_submissions` 테이블만 읽고 수정합니다.

관리자 페이지를 쓰려면 Supabase에서 먼저 아래 순서로 설정해야 합니다.

1. Supabase Authentication에서 관리자 계정을 이메일/비밀번호로 생성합니다.
2. SQL Editor에서 위 마이그레이션을 순서대로 실행합니다.
3. `admin_users` 테이블에 관리자 이메일을 등록합니다.

```sql
insert into public.admin_users (email, name)
values ('관리자이메일@example.com', '관리자')
on conflict (email) do update
set is_active = true,
    name = excluded.name;
```

관리자 화면에서 가능한 작업:

- 신청자 전체 목록 조회와 이름/학교/연락처/카카오톡 검색
- 일정, 성별, 검토상태, 입금상태, 매칭상태별 필터링
- 표 헤더 클릭 정렬
- 신청자 상세 정보와 첨부파일 확인
- `new`, `reviewed`, `matched`, `rejected`, `cancelled` 상태 변경
- 입금상태, 매칭상태, 점수, 매칭 그룹, 관리자 메모 저장
- 남성 1명과 여성 1명을 선택해 `application_submissions`에 매칭 상태 저장
