# Changelog

## [0.1.1] - 2026-03-23

### Fixes
- 핸드오프 아카이브에서 API 키 제거 (보안)
- 인앱 브라우저 감지 추가 (OAuth 리다이렉트 호환성)

### Docs
- README 업데이트 (기능 요약, 프로젝트 구조, 기술 스택)
- 테스트 계획 작성 (33개 테스트 케이스)

### Chore
- PMS 스타일 핸드오프 시스템 전환 (역할별 인박스)

---

## [0.1.0] - 2026-03-22

### Features
- F1: Google 로그인 (Supabase Auth)
- F2: 옷장 관리 (카테고리 + 색상 등록/삭제, 그루핑)
- F3: 날씨 기반 AI 코디 추천 (Gemini, 온도 기반)
- F3: 시간대별 날씨 차트 (기상청 단기예보)
- PWA 지원 (오프라인, 홈화면 추가)

### Tech Stack
- Vanilla JS + Lit 3 + Vite 6
- Supabase (Auth, PostgreSQL, Edge Functions)
- Gemini API, 기상청 단기예보 API
