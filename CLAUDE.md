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

## LLM-Wiki 패턴 (지식 유지보수)

Karpathy의 LLM-Wiki 패턴을 차용. 사람은 **결정·판단**, LLM은 **유지보수**를 담당한다.

### 구조 매핑
| 계층 | 파일/경로 | 역할 |
|------|-----------|------|
| 원본 소스 | `src/`, `git log`, `docs/handoff/archive/` | 불변, 읽기 전용 참조 |
| 위키 | `docs/specs/`, `docs/design/`, `docs/test-plans/`, `docs/log.md` | LLM이 유지보수 |
| 스키마 | `CLAUDE.md` (이 파일) | 사람+LLM 공동 진화 |

### docs/log.md (프로젝트 내러티브 로그)
- **append-only** — 과거 엔트리 수정 금지
- git log와 **보완 관계**: git = 커밋 단위 / log.md = 세션·결정 단위
- 모든 역할이 작성 가능 (PM, Designer, Developer, Tester)
- 세션 종료 시 중요 사건 1~3줄 append

**포맷**:
```markdown
## [YYYY-MM-DD] type | title
(선택) 1~3줄 본문 — 결정 이유, 컨텍스트
```

**타입**:
- `feat` — 기능 구현
- `fix` — 버그 수정
- `research` — 조사, 학습, 외부 자료 검토
- `decision` — 방향 전환, 주요 결정
- `handoff` — 세션 간 중요 인계
- `lint` — 드리프트 점검 결과
- `release` — 버전 릴리즈

**언제 쓰나** (커밋 메시지로 충분한 건 제외):
- 커밋에 안 담기는 **결정·연구·논의**
- 방향 전환, 피벗, 트레이드오프
- 외부 자료 검토 후 결론

### /lint 커맨드 (드리프트 점검)
- PM 세션 시작 시 권장 실행
- `docs` vs `src` / `git log` / `tests` 간 모순 자동 탐지
- 상세: `.claude/commands/lint.md`

### 역할 분담 원칙
- **Ingest** (새 정보 추가): **사람이 판단** — 코드 변경은 자동화 금지
- **Query** (질의): LLM이 위키 읽고 답변
- **Lint** (정리): **LLM이 실행** — 피로 없는 반복 작업

---

## 폴더 구조
```
daily-coordination/
├── CLAUDE.md
├── .mcp.json
├── .claude/commands/    # 역할별 슬래시 커맨드
├── docs/
│   ├── log.md           # 프로젝트 내러티브 로그 (append-only)
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
