# Daily Coordination

날씨 기반 AI 코디 추천 웹 앱.
매일 아침 기상청 날씨 예보를 기반으로 Gemini AI가 사용자의 옷장에서 오늘의 코디를 추천합니다.

## 주요 기능

- **Google / 이메일 로그인** — Supabase Auth (OAuth + Email)
- **내 옷장 관리** — 카테고리 + 색상으로 등록/삭제, 카테고리순·색상별 그루핑
- **AI 코디 추천** — 오늘 날씨 + 내 옷장 기반으로 Gemini AI가 코디 추천
- **시간대별 날씨** — 기상청 단기예보 기반 SVG 온도 커브 차트
- **반응형 디자인** — 모바일(하단 탭) + 데스크톱(상단 네비, 2컬럼 레이아웃)
- **PWA** — 오프라인 지원, 홈화면 추가 가능

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vanilla JS + Lit 3 + Vite 6 |
| 상태관리 | zustand 스타일 pub/sub Store + Lit ReactiveController |
| 디자인 | Atomic Design (atoms → molecules → organisms → pages) |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| AI | Gemini 2.5 Flash (Supabase Edge Function) |
| 날씨 | 기상청 단기예보 API (apihub.kma.go.kr) |
| 배포 | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
daily-coordination/
├── src/
│   ├── components/
│   │   ├── atoms/        # dc-button, dc-input, dc-chip, dc-spinner, ...
│   │   ├── molecules/    # weather-card, hourly-weather, closet-item, color-picker
│   │   ├── organisms/    # outfit-card, empty-state, add-clothing-modal
│   │   ├── templates/    # app-shell (GNB + 레이아웃)
│   │   ├── pages/        # home-page, closet-page, login-page
│   │   └── app/          # dc-app (루트, Router, Context Provider)
│   ├── constants/        # clothing, colors, weather 공유 상수
│   ├── utils/            # color, timezone, closet-grouping, recommendation, weather-chart
│   ├── store/            # auth, closet, recommend 상태 관리
│   ├── services/         # supabase, auth, closet, recommend 서비스
│   ├── styles/           # tokens, reset, breakpoints, material-icons
│   ├── contexts/         # Lit @lit/context (Supabase DI)
│   └── router/           # Hash 기반 SPA 라우터
├── supabase/
│   ├── migrations/       # DB 스키마 (clothing_categories, user_clothes, recommendations)
│   └── functions/        # Edge Functions (weather, recommend)
├── docs/
│   ├── specs/            # 요구사항 명세
│   ├── design/           # 디자인 시스템 (DESIGN.md, components.md, Stitch 스크린)
│   └── test-plans/       # 테스트 계획
└── public/               # PWA manifest, 아이콘
```

## 버전 히스토리

### v0.1.0 (2026-03-22) — 프로토타입

첫 번째 릴리즈. 핵심 3개 기능 구현 완료.

**F1: 인증**
- Google OAuth + 이메일 로그인/회원가입
- 인증 가드 (미로그인 시 리다이렉트)
- 로그인/회원가입 페이지 — 모바일 Hero + 데스크톱 2컬럼

**F2: 옷장 관리**
- 28개 카테고리 (아우터/상의/하의/신발/액세서리)
- 13개 색상 프리셋으로 옷 등록
- 카테고리순/색상별 그루핑 토글
- 바텀시트 모달 (2단 카테고리 선택 + 컬러 피커)

**F3: AI 코디 추천**
- 기상청 단기예보 API (서울, 3시간 간격)
- Gemini 2.5 Flash 기반 온도별 코디 추천
- SVG bezier 온도 커브 차트
- 날씨 카드 (glass pill meta, 4종 그라데이션)
- "다른 코디 추천" 버튼 (캐시 무시 재생성)

**인프라**
- Atomic Design 패턴 (6 atoms, 5 molecules, 3 organisms, 3 pages)
- zustand 스타일 Store + Lit ReactiveController
- Supabase Edge Functions (weather, recommend)
- PWA (Service Worker, manifest)
- 반응형 디자인 (모바일 + 데스크톱)
- Stitch MCP 기반 디자인 시스템

## License

MIT
