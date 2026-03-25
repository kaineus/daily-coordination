# Daily Coordination

## 프로젝트 개요
날씨 기반 AI 코디 추천 웹 앱.
매일 아침 기상청 날씨 예보를 기반으로 Gemini AI가 사용자의 옷장에서
오늘의 코디를 추천한다. 추천 UI는 A2UI로 동적 생성.

### 프로토타입 기능
- **F1**: Google 로그인 (Supabase Auth)
- **F2**: 옷 등록 — 카테고리 + 색상으로 간단 등록
- **F3**: 날씨 기반 AI 코디 추천 — Gemini → A2UI JSON → Lit 렌더링

## 기술 스택
- Frontend: Vanilla JS + Vite + Lit (A2UI 렌더러)
- A2UI: v0.9 — AI 코디 추천 결과 UI 동적 생성
- Backend: Supabase (Auth, PostgreSQL, Edge Functions)
- AI: Gemini API (Edge Functions에서 호출)
- 날씨: 기상청 단기예보 API
- Design: Google Stitch (MCP 연동)
- 배포: Vercel 또는 Netlify

## 멀티세션 워크플로우
4개의 Claude Code 세션(cmux pane)이 역할별로 동작한다.

### 역할 설정
각 pane에서 `CLAUDE_ROLE` 환경변수를 설정한 후 세션을 시작:
```bash
export CLAUDE_ROLE=pm        # Pane 1
export CLAUDE_ROLE=designer  # Pane 2
export CLAUDE_ROLE=developer # Pane 3
export CLAUDE_ROLE=tester    # Pane 4
```
훅은 `CLAUDE_ROLE` 환경변수를 우선 읽고, 없으면 `.claude/current-role` 파일을 폴백으로 사용한다.

| 세션 | 환경변수 | 커맨드 | 역할 |
|------|---------|--------|------|
| 1 | `CLAUDE_ROLE=pm` | `/pm` | 요구사항 정의, 세션 간 조율 |
| 2 | `CLAUDE_ROLE=designer` | `/designer` | Stitch MCP로 UI 디자인 |
| 3 | `CLAUDE_ROLE=developer` | `/developer` | 구현 |
| 4 | `CLAUDE_ROLE=tester` | `/tester` | 테스트 계획 및 자동화 |

## 세션 간 협업 규칙
세션은 `docs/` 폴더를 통해 작업 결과를 공유한다.
작업 시작 전 다른 역할의 출력 디렉토리를 반드시 읽는다.

### 핸드오프 시스템 (PMS 스타일)
세션 간 지시사항은 **역할별 인박스 디렉토리**를 통해 전달된다.

#### 디렉토리 구조
```
docs/handoff/
├── to-designer/     # PM → Designer
├── to-developer/    # PM, Designer → Developer
├── to-tester/       # PM, Developer → Tester
└── archive/         # 처리 완료된 핸드오프
```

#### 라우팅 규칙
| 발신자 | 수신 가능 대상 |
|--------|---------------|
| PM | designer, developer, tester |
| Designer | developer |
| Developer | tester |
| Tester | developer (버그 수정 요청) |

PM은 **발신만** 하며, 수신은 각 역할의 산출물 디렉토리(`docs/`)를 직접 읽어 확인한다.

#### 파일명 규칙
`{날짜}-{시간}-{발신역할}.md` (예: `2026-03-23-0900-pm.md`)

#### 훅 동작
- **UserPromptSubmit**: `.claude/current-role`을 읽어 현재 역할의 인박스(`to-{역할}/`)를 스캔, 미확인 핸드오프 알림
- **Stop**: 세션 종료 시 핸드오프 작성 유도 + 처리 완료 건 archive 안내

#### 처리 흐름
1. 핸드오프 수신 → 내용 확인 및 작업 반영
2. 작업 완료 → 해당 파일을 `archive/`로 이동
3. 필요 시 다음 역할에게 새 핸드오프 발신

| 디렉토리 | 작성자 | 내용 |
|----------|--------|------|
| `docs/specs/` | PM | 요구사항, A2UI 명세 |
| `docs/design/` | Designer | DESIGN.md, 컴포넌트 명세, 화면 HTML |
| `docs/test-plans/` | Tester | 테스트 계획, 버그 리포트 |
| `src/` | Developer | 소스 코드 |
| `tests/` | Tester | 테스트 코드 |

## 폴더 구조
```
daily-coordination/
├── CLAUDE.md
├── .mcp.json
├── .claude/commands/    # 역할별 슬래시 커맨드
├── docs/
│   ├── specs/           # PM 산출물
│   ├── design/          # Designer 산출물
│   │   └── screens/     # Stitch HTML/스크린샷
│   ├── test-plans/      # Tester 산출물
│   └── handoff/         # 세션 간 핸드오프
│       ├── to-designer/
│       ├── to-developer/
│       ├── to-tester/
│       └── archive/
├── src/                 # 소스 코드
└── tests/               # 테스트 코드
```
