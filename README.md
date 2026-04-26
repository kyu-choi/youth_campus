# 청춘 캠퍼스

정적 랜딩 페이지를 유지하면서, 나중에 Supabase 백엔드를 붙이기 쉽게 구조를 분리해 둔 프로젝트입니다.

브라우저에서 `index.html`을 바로 열어도 동작하도록, 빌드 도구 없이 `defer` 스크립트 순서 기반으로 구성했습니다.
기본 템플릿은 모바일 웹 우선 기준으로 작성했고, 큰 화면에서는 점진적으로 확장되도록 스타일을 분리했습니다.

## 현재 수정 포인트

- 랜딩 문구, 인스타그램 주소, 버튼 문구와 링크: `src/js/config/site-config.js`
- Supabase 연결 정보와 테이블명: `src/js/config/supabase-config.js`
- 디자인 토큰과 페이지 스타일: `src/styles/`

## 디렉터리 구조

```text
.
|-- index.html
|-- README.md
|-- src
|   |-- js
|   |   |-- config
|   |   |   |-- site-config.js
|   |   |   `-- supabase-config.js
|   |   |-- dom
|   |   |   `-- landing-elements.js
|   |   |-- services
|   |   |   |-- campus-content-service.js
|   |   |   `-- supabase-client.js
|   |   |-- ui
|   |   |   |-- render-contact.js
|   |   |   |-- render-hero.js
|   |   |   |-- render-instagram.js
|   |   |   `-- render-quick-links.js
|   |   `-- main.js
|   `-- styles
|       |-- base.css
|       |-- components.css
|       |-- landing.css
|       |-- main.css
|       `-- tokens.css
`-- supabase
    |-- functions
    |   `-- .gitkeep
    |-- migrations
    |   `-- .gitkeep
    `-- README.md
```

## Supabase 연결 흐름

1. 현재는 `site-config.js`의 정적 데이터를 먼저 렌더링합니다.
2. 이후 `supabase-config.js`에서 `enabled`, `url`, `anonKey`를 채우고 Supabase 클라이언트를 연결하면 `campus-content-service.js`가 DB 데이터를 먼저 읽습니다.
3. DB 조회 실패 시에는 자동으로 정적 데이터로 돌아가도록 구성해 두었습니다.

## 추천 테이블 예시

- `landing_content`: 히어로 문구, 인스타그램 문구, 문의 문구처럼 페이지 공통 텍스트 저장
- `landing_links`: 버튼 라벨, URL, 정렬 순서, 노출 여부 저장
