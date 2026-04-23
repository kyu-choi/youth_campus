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
