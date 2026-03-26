---
from: developer
to: tester
date: 2026-03-26
time: 12:00
priority: P1
---

## 변경 사항
- F4 자연어 옷 등록 기능 구현 완료
- F2 옷장 2depth 그룹 표시 구현 완료
- Auth redirectTo 로컬 개발 호환 수정
- vitest + jsdom 테스트 환경 이미 구성됨 (package.json, vitest.config.js)

## 다음 작업 지시

### F4 테스트 실행 요청

모든 인수 조건이 구현되었으므로 테스트 계획(`docs/test-plans/f4-chat-register.md`)에 따라 테스트 진행 가능.

#### 구현 완료 항목
1. **Edge Function `chat-register`** — `supabase/functions/chat-register/index.ts`
   - Gemini 2.5-flash 기반 파싱
   - 25개 색상 프리셋 + 자유 색상명 지원
   - 복수 아이템 파싱, 되묻기(needsClarification + suggestions)

2. **프론트엔드 모달 통합** — `src/components/organisms/add-clothing-modal.js`
   - 모달 상단 AI 입력 섹션 + 기존 수동 선택 공존
   - parsed-item-card로 파싱 결과 표시
   - suggestion-chip으로 되묻기 선택지 표시
   - 등록 시 기존 addClothing() 서비스 재사용

3. **F2 2depth 그룹** — `src/utils/closet-grouping.js`, `src/components/pages/closet-page.js`
   - type > category 서브그룹 렌더링
   - 아이템 카드 표시명: "색상명 + 카테고리명"

#### 테스트 우선순위
1. Edge Function 단위 테스트 (기존 테스트 파일: `tests/edge-functions/chat-register.test.js`)
2. 파싱 → 등록 통합 흐름
3. F2 2depth 그룹 표시 확인

### 참고
- `docs/specs/requirements.md` — F4 인수 조건
- `docs/test-plans/f4-chat-register.md` — F4 테스트 계획
- 태그 `v0.2.0`으로 배포 완료
