---
description: 프로젝트 docs 드리프트 자동 점검 (LLM-Wiki Lint)
---

너는 이 프로젝트의 **드리프트 린터**다. `docs/`와 `src/`/`git log`/`tests/` 간 모순을 탐지하고 리포트한다.

## 목적
사람이 놓치는 docs 드리프트를 자동 탐지. Karpathy LLM-Wiki 패턴의 Lint 연산.

## 검사 항목 (6개)

### 1. requirements.md 상태 드리프트
`docs/specs/requirements.md`의 각 Feature(F1, F2, ...)에 대해:
- 상태 필드(`draft`, `ready`, `in-progress`, `done`) 파싱
- `git log --oneline | grep "F{N}"`로 해당 기능 커밋 확인
- 해당 테스트 파일 존재 확인 (`tests/**/*F{N}*` 또는 내용 기반)
- **모순 패턴**:
  - 상태가 `draft`/`ready`인데 `feat(F{N})` 커밋 존재 → "구현 완료인데 상태 미갱신"
  - 상태가 `in-progress`인데 테스트 통과 + 커밋 여러 개 → "완료 가능"
  - 상태가 `done`인데 커밋/테스트 없음 → "근거 부족"

### 2. test-plan.md TC 수 일치
`docs/test-plans/test-plan.md`에 선언된 TC 수 vs 실제 테스트 파일의 `it(...)` 카운트.
- `grep -c "^\s*it\(" tests/**/*.test.js`로 실제 카운트
- test-plan.md의 "**240 TC**" 등 선언 값과 비교
- 차이 있으면 리포트

### 3. docs 간 수치 모순
`docs/specs/requirements.md`, `docs/design/DESIGN.md`, `docs/design/components.md` 간:
- 색상 팔레트 수 (25 vs 13 등)
- 카테고리 수
- 아이콘/이모지 매핑
- 상수 이름 (`TYPE_ICONS` vs `TYPE_MATERIAL_ICONS` 등)

### 4. 고아 핸드오프
`docs/handoff/to-designer/`, `to-developer/`, `to-tester/` 각각:
- 파일 mtime이 현재로부터 7일 이상 경과 → "처리 지연"
- 파일명에서 날짜 추출 가능하면 그 기준 사용

### 5. DB 스키마 vs 마이그레이션
`docs/specs/requirements.md`의 "DB 스키마" 섹션에 선언된 테이블 목록 vs `supabase/migrations/*.sql`의 `create table` 선언.
- 요구사항에 있는데 마이그레이션 없음 → "미구현"
- 마이그레이션에 있는데 요구사항 문서에 없음 → "미문서화"

### 6. CLAUDE.md 경로/파일 참조 유효성
`CLAUDE.md`, `.claude/commands/*.md`에서 언급하는 경로/파일이 실제 존재하는지 확인.

## 실행 방식

1. 위 6개 검사를 순서대로 실행
2. 각 검사마다 **Glob/Grep/Read/Bash(git log)** 도구 사용
3. 발견된 문제를 아래 형식으로 집계

## 출력 형식

```markdown
# Lint Report — YYYY-MM-DD

## 🔴 Critical (즉시 수정 권장)
- [항목]: 설명 + 위치(파일:라인)

## 🟡 Warning (검토 필요)
- [항목]: 설명

## 🟢 OK (통과)
- 1. requirements.md 상태 드리프트: 정상
- ...

## 제안 액션
- [ ] 구체적 수정 지시
```

## 후속 처리

- Critical 항목 발견 시: 사용자에게 수정 여부 확인
- 수정 완료 후: `docs/log.md`에 다음 형식으로 엔트리 추가
  ```
  ## [YYYY-MM-DD] lint | 드리프트 N건 수정
  - 수정 항목 요약 (1~2줄)
  ```

## 주의사항

- **코드는 수정하지 말 것** — 드리프트는 **문서 쪽**을 맞춘다 (코드가 ground truth)
- 예외: 명백한 문서 일치가 코드 버그를 드러내면 사용자에게 알린다
- 의심스러우면 Warning으로 분류 (Critical 남발 금지)

## 첫 번째 행동

1. git log 최근 30개 확인
2. tests/ 디렉토리 전체 TC 카운트
3. docs/ 주요 파일 읽기
4. 6개 검사 수행
5. 리포트 출력
