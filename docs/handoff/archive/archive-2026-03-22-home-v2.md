---
from: PM
to: Developer, Designer, Tester
date: 2026-03-22
time: 18:30
---

## 작업 지시: F3 홈 화면 — AI 코디 추천 + 시간대별 날씨

requirements.md가 업데이트됨. 반드시 읽고 시작할 것.

---

### Designer 작업

#### 디자인 시스템 추가 (DESIGN.md, components.md)
- 하늘상태별 아이콘/배경 그라데이션 추가:
  - 맑음 ☀️, 구름많음 ⛅, 흐림 ☁️, 비 🌧️, 눈 ❄️, 비/눈 🌨️
- hourly-weather 컴포넌트 스펙 추가

#### Stitch 화면 생성
1. **홈 페이지 모바일** (`docs/design/screens/home-page.html`)
   - ① AI 코디 추천 카드 (최상단): 요약 + 컬러팔레트 + 아이템별 추천이유 + 팁 + 다른코디 버튼
   - ② 날씨 요약: 현재기온 + 하늘상태 아이콘 + 최저/최고 + 강수확률 + 풍속
   - ③ 시간대별 날씨 차트: 가로스크롤, 3시간 간격, 시각+아이콘+기온+풍속

2. **홈 페이지 데스크톱** (`docs/design/screens/home-page-desktop.html`)

---

### Developer 작업

#### 환경변수
```
GEMINI_API_KEY=(Supabase Secrets에서 관리)
KMA_API_KEY=(Supabase Secrets에서 관리)
```

#### 구현 순서
1. **Supabase secrets 설정**
2. **Edge Function: weather** — 기상청 API. current + today(최저/최고) + hourly(시간대별) 반환
3. **Edge Function: recommend** — Gemini 호출. **온도 기반** 프롬프트 (requirements.md 참조)
4. **hourly-weather.js** (신규) — 시간대별 날씨 가로 스크롤 컴포넌트
5. **weather-card.js 확장** — 최저/최고 기온, 풍속 props 추가
6. **recommend.service.js + recommend.store.js** (신규)
7. **home-page.js** (신규) — outfit-card → weather-card → hourly-weather
8. **dc-app.js** — "/" 라우트 교체

requirements.md의 F3 섹션에 온도별 추천 규칙, 하늘상태 매핑 등 상세 기술.

---

### Tester 작업

테스트 인프라 세팅 + F2/F3 테스트 계획 작성:
1. **Vitest 설치** 및 설정
2. **단위 테스트 계획**: services, stores, utils
3. **컴포넌트 테스트 계획**: closet-item, color-picker, weather-card, outfit-card, hourly-weather
4. **E2E 테스트 계획** (Playwright): 로그인→옷등록→코디추천 흐름
5. `docs/test-plans/test-plan.md` 작성
