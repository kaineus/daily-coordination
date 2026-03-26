# Test Plan — F5. 코디 추천 비주얼 업그레이드 (매거진 스크랩 스타일)

> 작성일: 2026-03-26
> 상태: draft
> 관련: `docs/specs/requirements.md` F5 섹션
> 구현 참조: `src/components/organisms/outfit-card.js`, `src/constants/svg-map.js`

---

## 테스트 전략

### 범위
| 구분 | 도구 | 대상 |
|------|------|------|
| SVG 매핑 상수 | Vitest | `svg-map.js` 매핑 완전성 |
| 유틸/렌더 로직 | Vitest | 색상 적용, 폴백 분기, 착장 순서 |
| 컴포넌트 | Vitest + @open-wc/testing | `outfit-card` Lit 컴포넌트 |
| E2E | Playwright | 실제 추천 → 스크랩 비주얼 표시 |

### 우선순위
1. **P0**: SVG 매핑 완전성 + 색상 적용 로직 — 핵심 비주얼 정합성
2. **P1**: 컴포넌트 렌더링 — DOM 구조, 레이아웃 순서
3. **P2**: E2E — 전체 흐름 통합

---

## 1. SVG 매핑 완전성 테스트

### TC-F5-001 30개 카테고리 전부 SVG 매핑 존재
- **우선순위**: P0
- **상태**: planned
- **사전조건**: `clothing_categories` 30개 카테고리명 목록, `SVG_MAP` import
- **단계**:
  1. requirements.md의 카테고리 목록 30개를 배열로 정의
  2. 각 카테고리명에 대해 `SVG_MAP[name]`이 truthy인지 확인
- **기대 결과**: 30개 전부 SVG raw string 반환 (누락 없음)

### TC-F5-002 SVG_MAP 값이 유효한 SVG 문자열
- **우선순위**: P0
- **상태**: planned
- **사전조건**: `SVG_MAP` import
- **단계**:
  1. `Object.values(SVG_MAP)` 순회
  2. 각 값이 `<svg`로 시작하는 문자열인지 확인
- **기대 결과**: 모든 값이 `<svg` 포함 문자열

### TC-F5-003 SVG에 currentColor 사용 확인
- **우선순위**: P0
- **상태**: planned
- **사전조건**: `SVG_MAP` import
- **단계**:
  1. 각 SVG raw string에서 fill 또는 stroke가 `currentColor`를 사용하는지 확인
- **기대 결과**: 모든 SVG가 `currentColor`를 사용하여 CSS color로 색상 제어 가능

---

## 2. 색상 적용 테스트

### TC-F5-004 hex 색상이 SVG wrap의 CSS color로 적용
- **우선순위**: P0
- **상태**: planned
- **사전조건**: `outfit-card` 컴포넌트, 아이템 데이터 (colorHex: "#FF4444")
- **단계**:
  1. `outfit-card`에 items=[{ name: "패딩", category: "아우터", colorHex: "#FF4444", colorName: "빨강" }] 전달
  2. `.svg-wrap` 요소의 inline style 확인
- **기대 결과**: `style="color: #FF4444"` 적용됨

### TC-F5-005 color-dot에 hex 색상 background 적용
- **우선순위**: P0
- **상태**: planned
- **사전조건**: 컴포넌트 렌더링 완료
- **단계**:
  1. `.color-dot` 요소의 inline style 확인
- **기대 결과**: `background: #FF4444` 적용됨

### TC-F5-006 흰색 계열 색상에 border 추가
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 아이템 colorHex: "#FFFFFF"
- **단계**:
  1. `.color-dot`과 `.palette-dot`에 `.white` 클래스 존재 확인
- **기대 결과**: `isWhiteColor` 판별 후 `.white` 클래스 추가 → outline border 표시

### TC-F5-007 colorHex 누락 시 기본 색상 폴백
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 아이템 colorHex: null 또는 undefined
- **단계**:
  1. `.svg-wrap` style 확인
  2. `.color-dot` style 확인
- **기대 결과**: svg-wrap → `color: #666`, color-dot → `background: #ccc` 폴백

---

## 3. 폴백 테스트

### TC-F5-008 SVG 없는 카테고리 → 이모지 폴백
- **우선순위**: P0
- **상태**: planned
- **사전조건**: `SVG_MAP`에 존재하지 않는 카테고리명
- **단계**:
  1. items=[{ name: "존재하지않는옷", category: "상의", colorHex: "#333" }] 전달
  2. `.svg-wrap` 내부 확인
- **기대 결과**: SVG 대신 `.emoji-fallback` 스팬에 이모지(👕) 표시

### TC-F5-009 TYPE_EMOJI에 없는 category → 기본 이모지
- **우선순위**: P1
- **상태**: planned
- **사전조건**: category가 TYPE_EMOJI에 없는 값
- **단계**:
  1. items=[{ name: "미분류", category: "기타", colorHex: "#333" }] 전달
- **기대 결과**: 기본 폴백 이모지 '👔' 표시

---

## 4. 레이아웃 & 착장 순서 테스트

### TC-F5-010 아이템이 위→아래 착장 순서로 배치
- **우선순위**: P0
- **상태**: planned
- **사전조건**: items 배열 (아우터, 상의, 하의, 신발 순)
- **단계**:
  1. `outfit-card`에 4개 아이템 전달
  2. `.scrap-row` 요소들의 DOM 순서 확인
- **기대 결과**: 첫 번째 row = 아우터, 두 번째 = 상의, 세 번째 = 하의, 네 번째 = 신발

### TC-F5-011 최대 4개 아이템만 렌더링
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 5개 이상 아이템 전달
- **단계**:
  1. items에 5개 아이템 전달
  2. `.scrap-row` 개수 확인
- **기대 결과**: `.scrap-row` 4개만 렌더링 (`items.slice(0, 4)`)

### TC-F5-012 홀수/짝수 행 교차 배치 (지그재그)
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 4개 아이템 렌더링
- **단계**:
  1. 각 `.scrap-row`의 클래스 확인
  2. index=0 → 클래스 없음, index=1 → `.even`, index=2 → 없음, index=3 → `.even`
- **기대 결과**: 짝수 index(1, 3)에 `.even` 클래스 → `flex-direction: row-reverse`

### TC-F5-013 각 카드에 고유 기울기(rotation) 적용
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 4개 아이템 렌더링
- **단계**:
  1. 각 `.scrap-card`의 transform style 확인
- **기대 결과**: ROTATIONS 배열에 따라 `-1.5deg`, `1deg`, `-0.5deg`, `1.5deg` 순서

### TC-F5-014 겹침 효과 (margin-top 음수)
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 2개 이상 아이템 렌더링
- **단계**:
  1. 2번째 `.scrap-row`부터 CSS computed style 확인
- **기대 결과**: `.scrap-row + .scrap-row`에 `margin-top: -1rem` 적용

---

## 5. 컴포넌트 기능 테스트

### TC-F5-015 summary 텍스트 렌더링
- **우선순위**: P1
- **상태**: planned
- **사전조건**: summary 속성 설정
- **단계**:
  1. `outfit-card` 에 summary="오늘은 따뜻하게!" 전달
  2. `.summary` 요소 텍스트 확인
- **기대 결과**: "오늘은 따뜻하게!" 표시

### TC-F5-016 summary 없으면 미렌더링
- **우선순위**: P1
- **상태**: planned
- **사전조건**: summary 미설정
- **단계**:
  1. `.summary` 요소 존재 여부 확인
- **기대 결과**: `.summary` 요소 없음

### TC-F5-017 색상 팔레트 도트 렌더링
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 3개 아이템 (각각 다른 colorHex)
- **단계**:
  1. `.palette-dot` 개수 및 배경색 확인
- **기대 결과**: 3개 도트, 각 아이템의 colorHex 배경

### TC-F5-018 tip 텍스트 렌더링
- **우선순위**: P1
- **상태**: planned
- **사전조건**: tip 속성 설정
- **단계**:
  1. `outfit-card`에 tip="안에 니트를 레이어드하세요" 전달
  2. `.tip-box` 텍스트 확인
- **기대 결과**: 팁 텍스트 + 💡 아이콘 표시

### TC-F5-019 "다른 코디 추천" 버튼 → dc-refresh 이벤트
- **우선순위**: P1
- **상태**: planned
- **사전조건**: 컴포넌트 렌더링 완료
- **단계**:
  1. `.refresh-btn` 클릭
  2. `dc-refresh` CustomEvent 수신 확인
- **기대 결과**: `bubbles: true, composed: true`인 이벤트 발생

### TC-F5-020 빈 items 배열 → scrap 영역 비어있음
- **우선순위**: P1
- **상태**: planned
- **사전조건**: items=[]
- **단계**:
  1. `.scrap-container` 내부 `.scrap-row` 개수 확인
- **기대 결과**: `.scrap-row` 0개, 에러 없음

---

## 6. E2E 테스트 (디자인/구현 완료 후)

### E2E-F5-01 코디 추천 → 스크랩 레이아웃으로 표시
- **우선순위**: P2
- **상태**: planned (blocked — 전체 통합 대기)
- **사전조건**: 로그인 + 옷장에 옷 등록 완료
- **단계**:
  1. 홈 페이지 로드
  2. AI 코디 추천 카드 확인
  3. SVG 일러스트 + 색상 적용 확인
  4. 수직 착장 순서 (아우터→상의→하의→신발) 확인
  5. 카드 기울기 + 겹침 + 텍스트 가독성 확인
- **기대 결과**: 매거진 스크랩 스타일 레이아웃으로 코디 표시

### E2E-F5-02 다양한 색상 조합에서 SVG 색상 정확성
- **우선순위**: P2
- **상태**: planned (blocked — 전체 통합 대기)
- **사전조건**: 다양한 색상의 옷 등록 (검정, 흰색, 빨강, 네이비 등)
- **단계**:
  1. 여러 번 "다른 코디" 버튼 클릭
  2. 각 추천 결과에서 SVG 색상이 등록된 옷의 hex와 일치하는지 확인
  3. 흰색 계열 아이템의 border 표시 확인
- **기대 결과**: 모든 색상이 SVG fill에 정확히 반영, 흰색은 border로 구분

---

## 테스트 파일 구조

```
tests/
├── constants/
│   └── svg-map.test.js          # TC-F5-001 ~ 003
├── components/
│   └── outfit-card.test.js      # TC-F5-004 ~ 020
└── e2e/
    └── f5-scrap-layout.spec.js  # E2E-F5-*
```

---

## 커버리지 목표 (F5)

| 레이어 | 목표 |
|--------|------|
| SVG 매핑 상수 | 100% |
| 색상 적용/폴백 로직 | 90%+ |
| 컴포넌트 렌더링 | 80%+ |
| E2E | 주요 2개 시나리오 커버 |
