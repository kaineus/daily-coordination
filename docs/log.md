# Project Log

Append-only 프로젝트 내러티브 로그. git log와 보완 관계:
- **git log**: 커밋 단위 기술 변경 기록
- **log.md**: 세션·결정·연구 단위 사람 친화적 기록

**포맷**: `## [YYYY-MM-DD] type | title` + (선택) 1~3줄 본문
**타입**: feat / fix / research / decision / handoff / lint / release

과거 엔트리 수정 금지 (append-only).

---

## [2026-04-08] lint | 첫 /lint 실행 — 드리프트 10건 수정
- requirements.md F1~F8 상태 전부 `done`으로 갱신 (8건)
- 누락 마이그레이션 파일 복원: `002_user_profiles_and_rbac.sql` (F6 RBAC, 원격에는 적용되어 있었으나 로컬 SQL 파일 누락)
- 마이그레이션 파일 리네임: `002_general_recommendations.sql` → `003_` (시간순)
- 260 TC 전부 통과 유지

## [2026-04-08] decision | LLM-Wiki 패턴 도입 — log.md + /lint
Karpathy의 LLM-Wiki 가이드 검토 후 우리 프로젝트의 docs 드리프트 문제를 해결하기 위해 경량 적용.
- `docs/log.md` 도입 (이 파일)
- `/lint` 슬래시 커맨드로 드리프트 자동 탐지
- INDEX.md는 의도적으로 생략 (docs 10개 규모에는 과잉)
- Ingest 자동화는 의도적으로 생략 (코드 변경 LLM 자동 연쇄는 위험)
사람은 결정·판단, LLM은 유지보수를 담당하는 역할 분담 원칙.

## [2026-04-08] research | LLM-Wiki 패턴 (Karpathy) 검토
news.hada.io + Karpathy gist 원문 검토.
핵심 통찰: RAG는 읽기만, LLM-Wiki는 **쓰기 연쇄**로 지식이 복합 성장.
Ingest/Query/Lint 3연산 중 Lint가 우리 프로젝트에 가장 큰 가치 — 드리프트 해결.

## [2026-04-06] feat | F8 일반 코디 추천 — 비로그인 Pexels 이미지
옷 등록 허들로 이탈하는 사용자를 위해 옷장 없이 날씨 기반 일반 추천 도입.
- 비로그인도 홈(`/`) 접근 허용
- Pexels API로 패션 이미지 검색 (무료 200req/hr)
- 로그인+빈옷장 사용자는 일반 추천으로 폴백 + "옷장 등록" 유도 배너
- 캐시: 날씨 조건별 공유 (date + weather_hash), Gemini API 비용 절약
- Edge Function `recommend-general` 배포, 마이그레이션 적용 (260 TC passed)

## [2026-04-06] decision | Pexels API 선택 (vs Unsplash, Google CSE)
이미지 검색 API 후보 비교 후 Pexels 선택.
- Google Custom Search: 100/day 무료 한계
- Unsplash: 한국 패션 키워드 품질 불안정
- **Pexels**: 200req/hour 무료, 한국어 지원, 어트리뷰션 불필요

## [2026-04-06] decision | 옷장 기반 → 일반 추천 피벗
옵션 A(공개 일반 피드) vs B(기존 추천 확장) 중 **A 선택**.
이유: 옷 등록 자체가 온보딩 허들. 비로그인 즉시 가치 제공이 핵심.
옵션 B는 결과적으로 홈이 여전히 보호됨 → 허들 문제 미해결.

## [2026-04-01] research | 코드 품질 점검 — 에러 핸들링 갭 다수 발견
PM 세션에서 P0~P3 보완 항목 15개 발견.
핵심: closet.service.js 세션 null 체크 누락, fetch try-catch 누락, UI 에러 피드백 silent fail.
→ Developer 핸드오프 발신 (2026-04-01-1000-pm.md).
후속: d25122f 에러 핸들링 테스트 추가 (248 TC).

## [2026-03-25] feat | F6 RBAC + F7 카테고리 관리 Admin 완료
user_profiles 테이블 + role 기반 가드 + admin 전용 카테고리 CRUD 페이지.
240 TC 전부 통과, 커버리지 98%/99%.

## [2026-03-25] feat | F4 자연어 등록 + F5 매거진 스크랩 비주얼
Gemini 파싱으로 "검정 패딩" → 카테고리+색상 자동 등록.
F5는 SVG 일러스트 + 스크랩 레이아웃으로 비주얼 업그레이드.

## [2026-03-24] decision | Gemini 이미지 생성 PoC — 불가 판정
무료 플랜에서 이미지 생성 API 접근 불가 (`docs/design/poc/gemini-image-poc-report.md`).
→ SVG 일러스트 방향으로 대체 결정. 후에 F8에서 Pexels API로 외부 이미지 도입.

## [2026-03-22] feat | F3 날씨 기반 AI 코디 추천 초기 구현
기상청 날씨 API + Gemini 2.5 Flash로 옷장 기반 추천.
"매거진 스크랩" 스타일 코디 카드가 이때 처음 등장.

## [2026-03-22] decision | 멀티세션 워크플로우 + 핸드오프 시스템 도입
PM/Designer/Developer/Tester 4개 세션이 `docs/handoff/` 인박스를 통해 비동기 협업.
PM은 발신만, 수신은 산출물 디렉토리 직접 읽기.
