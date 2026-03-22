# Daily Coordination

날씨 기반 AI 코디 추천 웹 앱.
매일 아침 기상청 날씨 예보를 기반으로 Gemini AI가 사용자의 옷장에서 오늘의 코디를 추천합니다.

## 주요 기능

- **Google 로그인** — Supabase Auth를 통한 간편 인증
- **옷 등록** — 카테고리 + 색상으로 내 옷장 관리
- **AI 코디 추천** — 오늘 날씨에 맞는 코디를 Gemini AI가 추천, A2UI로 동적 렌더링

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vanilla JS + Vite + Lit (A2UI 렌더러) |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| AI | Gemini API |
| 날씨 | 기상청 단기예보 API |
| 배포 | Vercel 또는 Netlify |

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase, Gemini, 기상청 API 키 입력

# 개발 서버 실행
npm run dev
```

## 프로젝트 구조

```
daily-coordination/
├── docs/
│   ├── specs/         # 요구사항 명세
│   ├── design/        # 디자인 시스템, 컴포넌트 명세
│   └── test-plans/    # 테스트 계획
├── src/               # 소스 코드
└── tests/             # 테스트 코드
```

## License

MIT
