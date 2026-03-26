# Component Specifications

> DESIGN.md의 디자인 토큰을 기반으로 한 컴포넌트 명세.

## 1. Buttons

### Primary Button
- **배경**: `--color-primary` (#005EA1)
- **텍스트**: `--color-on-primary` (#FFFFFF)
- **radius**: 12px
- **패딩**: 12px 24px
- **폰트**: Body Large (16px/Medium)
- **상태**: hover (밝기 +10%), active (밝기 -5%), disabled (40% 불투명도)

### Secondary Button (Outlined)
- **배경**: transparent
- **보더**: 1.5px solid `--color-primary`
- **텍스트**: `--color-primary`
- **상태**: hover (primary 배경 8% 불투명도)

### Ghost Button
- **배경**: transparent
- **텍스트**: `--color-primary`
- **상태**: hover (surface-container-high 배경)

### Accent Button
- **배경**: `--color-secondary-container` (#FF6B6B)
- **텍스트**: white
- **용도**: 감성적 액션 ("이 코디 좋아요")

## 2. Cards

### Weather Card
- **배경**: 하늘상태별 그라데이션 (DESIGN.md 하늘상태 매핑 참조)
- **텍스트**: white
- **radius**: 16px
- **패딩**: 24px
- **내용**:
  - 위치명 (Caption)
  - 현재 기온 (Display, 28px Bold)
  - 하늘상태 아이콘 + 텍스트 (Body)
  - 최저/최고 기온 (Body, white 90%) — "최저 11° · 최고 22°"
  - 강수확률 + 풍속 (Caption, white 70%) — "강수확률 10% · 풍속 2.3m/s"

### Hourly Weather Item (시간대별 날씨)
- **컨테이너**: 가로 스크롤 (overflow-x: auto, snap scroll, 스크롤바 숨김)
- **각 아이템**: 80px 너비
- **배경**: `--color-surface-lowest` (#FFFFFF)
- **radius**: 12px
- **패딩**: 16px 8px (세로/가로)
- **내용** (세로 중앙 정렬):
  - 시각 (Caption, 12px, on-surface-variant) — "09시"
  - 하늘상태 아이콘 (24px)
  - 기온 (Title, 16px SemiBold, on-surface) — "14°"
  - 풍속 (Caption, 10px, outline) — "2.1m/s"
- **차트 효과**: 기온에 따라 아이템 내 온도 텍스트 위치를 수직으로 조정하여 시각적 온도 변화 표현
- **간격**: 아이템 간 12px gap
- **데스크톱**: 스크롤 없이 한 줄 배치, 각 100px 너비

### Outfit Recommendation Card
- **배경**: `--color-surface-lowest` (#FFFFFF)
- **radius**: 16px
- **패딩**: 20px
- **shadow**: ambient (플로팅 시)
- **내용**:
  - 카테고리 라벨 (Caption, on-surface-variant)
  - 옷 이름 (Title, 16px SemiBold)
  - 색상 도트 (16px 원형) + 색상명
  - 추천 이유 (Body, on-surface-variant)
- **레이아웃**: 아우터/상의/하의/신발 각 1개씩, 수직 스택

### Closet Item Card
- **배경**: `--color-surface-lowest`
- **radius**: 12px
- **패딩**: 16px
- **내용**:
  - 색상 도트 (24px 원형, 해당 색상)
  - 카테고리명 (Body, bold)
  - 색상명 (Caption)
  - 삭제 버튼 (아이콘, 우측)

## 2.5 Closet Subgroup Header (2depth 카테고리)

### Type Header (1depth — 기존)
- **태그**: `<h2>`
- **폰트**: 모바일 16px semibold / 데스크톱 20px bold (headline)
- **아이콘**: Material Symbols (또는 이모지)
- **개수 뱃지**: `text-outline`, 14px medium

### Category Subheader (2depth — 신규)
- **태그**: `<h3>`
- **폰트**: 모바일 12px semibold / 데스크톱 13px semibold
- **색상**: `--color-on-surface-variant`
- **자간**: `tracking-wide`
- **개수**: 모바일 10px / 데스크톱 11px, `--color-outline`
- **들여쓰기**: `padding-left: 12px` (모바일/데스크톱 동일)
- **간격**: 서브헤더 → 아이템 카드 `margin-bottom: 8px` (모바일) / `12px` (데스크톱)
- **서브그룹 간 간격**: `margin-bottom: 16px` (모바일) / `24px` (데스크톱)

### 아이템 카드 표시명 변경
- 기존: 카테고리명만 표시 (예: "패딩")
- 변경: **색상명 + 카테고리명** (예: "검정 패딩", "네이비 패딩")
- 이유: 서브헤더에 카테고리명이 있으므로, 카드에서는 색상으로 구분

## 3. Form Elements

### Text Input
- **배경**: `--color-surface-lowest`
- **보더**: 없음 (No-Line 원칙)
- **radius**: 8px
- **포커스**: 배경 → `--color-surface-variant`로 전환
- **라벨**: Caption (12px), on-surface-variant
- **값**: Body (14px), on-surface

### Select / Dropdown
- **스타일**: Text Input과 동일
- **드롭다운**: surface-lowest 배경, ambient shadow
- **아이템**: 16px 패딩, hover 시 surface-container-low

### Color Picker (프리셋)
- **레이아웃**: 원형 버튼 그리드 (가로 스크롤 또는 wrap)
- **크기**: 32px 원형
- **선택 상태**: 2px solid white 보더 + ambient shadow
- **프리셋 색상**:
  | 이름 | Hex |
  |------|-----|
  | 빨강 | #FF4444 |
  | 주황 | #FF8844 |
  | 노랑 | #FFCC00 |
  | 초록 | #44BB44 |
  | 파랑 | #4488FF |
  | 남색 | #2244AA |
  | 보라 | #8844CC |
  | 분홍 | #FF88AA |
  | 흰색 | #FFFFFF |
  | 회색 | #999999 |
  | 검정 | #333333 |
  | 갈색 | #8B4513 |
  | 베이지 | #D2B48C |

## 4. Tags / Chips

### Category Chip
- **배경**: `--color-surface-container-high` (#E8E8EC)
- **텍스트**: `--color-on-surface-variant`
- **radius**: 20px (pill)
- **패딩**: 6px 14px
- **폰트**: Caption (12px)
- **선택 상태**: 배경 → `--color-primary-fixed` (#D2E4FF), 1px ghost border

### 카테고리별 칩 색상
| 카테고리 | 배경 (선택 시) | 아이콘 |
|----------|---------------|--------|
| 아우터 | #D2E4FF (blue tint) | 🧥 |
| 상의 | #FFE8E8 (coral tint) | 👕 |
| 하의 | #E8F5E9 (green tint) | 👖 |
| 신발 | #FFDEAB (amber tint) | 👟 |
| 액세서리 | #F3E8FF (purple tint) | 🎩 |

## 5. Navigation

### Bottom Tab Bar
- **배경**: `--color-surface-lowest` (#FFFFFF)
- **높이**: 64px
- **shadow**: 위쪽 방향 ambient shadow
- **탭 구성** (2탭):
  | 탭 | 아이콘 | 라벨 | 라우트 |
  |-----|--------|------|--------|
  | 코디 | ☀️ (날씨) | 오늘의 코디 | `/` |
  | 옷장 | 👔 (옷) | 내 옷장 | `/closet` |
- **활성 상태**: `--color-primary` 아이콘 + 라벨
- **비활성 상태**: `--color-outline` 아이콘 + 라벨

## 6. Empty States

### 옷장 비어있을 때
- 일러스트 또는 큰 아이콘 (👕 64px)
- 메시지: "옷장에 옷을 먼저 등록해주세요" (Heading 2)
- 서브텍스트: "카테고리와 색상으로 간단히 등록할 수 있어요" (Body)
- CTA 버튼: "옷 등록하기" (Primary Button)

### 추천 불가 시
- 메시지: "오늘의 코디를 추천하려면 옷이 필요해요"
- 옷장 페이지 링크 버튼

## 7. Weather Icons (커스텀 일러스트)

이모지 대신 **커스텀 SVG 스타일 일러스트 아이콘** 사용. 레퍼런스: `screens/components-weather-icons.html`

| 상태 | 스타일 | 글로우 색상 | 배경 그라데이션 (135deg) |
|------|--------|-----------|------------------------|
| 맑음 | 황금빛 태양 + 그라데이션 광선 | #FFC107 | `#FFC107` → `#FF6B6B` |
| 구름많음 | 태양 + 회색 구름 | #E8E8EC | `#E8E8EC` → `#FFFFFF` |
| 흐림 | 겹친 회색 구름 | #C1C7D2 | `#C1C7D2` → `#E8E8EC` |
| 비 | 어두운 구름 + 빗방울 | #005EA1 | `#005EA1` → `#717782` |
| 눈 | 흰/아이스블루 구름 + 눈꽃 | #D2E4FF | `#FFFFFF` → `#D2E4FF` |
| 비/눈 | 혼합 구름 + 빗방울/눈꽃 | #005EA1 | `#005EA1` → `#D2E4FF` |

### 아이콘 사이즈
| 용도 | 사이즈 | 글로우 |
|------|--------|--------|
| 데스크톱 히어로 | 64~96px | O (radial glow) |
| 모바일 날씨 카드 | 48~80px | O |
| 시간대별 차트 | 20~24px | X (compact) |

## 8. Temperature Curve Chart (기온 곡선 차트)

시간대별 날씨를 **부드러운 곡선 라인 차트**로 시각화.

- **라인**: `--color-primary` (#005EA1), 2px, SVG bezier curve
- **채우기**: 곡선 아래 `--color-primary-fixed` (#D2E4FF) 20% opacity → transparent 그라데이션
- **데이터 포인트**:
  - 도트: 8px 원형 (primary outline, white fill)
  - 현재 시간: 12px 원형 (primary filled) + 수직 점선
  - 기온 라벨: 도트 위 (14px Bold)
  - 아이콘: 곡선 아래 (20px, 커스텀 일러스트)
  - 시각: 아이콘 아래 (12px, on-surface-variant)
- **모바일**: 가로 스크롤, 8개 시간대, snap scroll
- **데스크톱**: 스크롤 없이 전체 표시
- **카드**: white bg, 16px radius, 20px padding

## 9. Chat Components (F4 자연어 옷 등록)

### Message Bubble (AI)
- **배경**: `--color-surface-container-lowest` (#FFFFFF) — 모바일 / `--color-surface-container-low` (#F3F3F7) — 데스크톱
- **radius**: 16px (bubble-ai: bottom-left 4px)
- **패딩**: 16px 20px
- **shadow**: `0px 4px 12px rgba(26,28,31,0.04)`
- **아바타**: 28px 원형, `--color-primary-fixed` 배경, `auto_awesome` 아이콘 (filled)
- **타임스탬프**: Caption (10px), outline 색상

### Message Bubble (User)
- **배경**: `--color-primary` (#005EA1)
- **텍스트**: `--color-on-primary` (#FFFFFF)
- **radius**: 16px (bubble-user: bottom-right 4px)
- **패딩**: 12px 16px
- **최대 너비**: 모바일 75%, 데스크톱 65%
- **타임스탬프**: 10px, white/60%

### Parsed Item Card
- **배경**: `--color-surface-container-lowest`
- **radius**: 12px
- **패딩**: 14px 16px
- **shadow**: `0px 4px 12px rgba(26,28,31,0.04)`
- **내용**:
  - 카테고리 아이콘 (40px 정사각, `surface-container-low` 배경, 8px radius)
  - 카테고리명 (Body, semibold)
  - 색상 도트 (14px 원형) + 색상명 (Caption)
  - 체크 아이콘 (우측, `--color-success` filled)
- **데스크톱**: 복수 카드 가로 배치 (flex-row)
- **모바일**: 세로 스택 (flex-col)

### Suggestion Chip (되묻기)
- **배경**: `--color-surface-container-lowest` — 모바일 / `--color-surface-container-low` — 데스크톱
- **radius**: full (pill)
- **패딩**: 8px 14px
- **폰트**: Body (14px), medium
- **텍스트**: `--color-on-surface-variant`
- **shadow**: `0px 2px 8px rgba(26,28,31,0.04)` (모바일)
- **선택/hover**: 배경 → `--color-primary-fixed`, 텍스트 → `--color-on-primary-fixed-variant`
- **내용**: 카테고리 이모지 + 카테고리명

### Chat Input Bar
- **위치**: 하단 sticky (모바일), 채팅 패널 하단 (데스크톱)
- **배경**: white/80% + backdrop-blur-xl (모바일) / surface-container-lowest (데스크톱)
- **입력 필드**: `--color-surface-container-low` 배경, 16px radius, 44px 최소 높이
- **전송 버튼**: 44px 원형, `--color-primary` 배경, `send` 아이콘
- **빠른 제안 칩**: 입력바 아래, 가로 스크롤, `surface-container-low` 배경, Caption (12px)

### Typing Indicator
- **3개 도트**: 8px 원형, `--color-outline`
- **애니메이션**: 순차적 bounce (1.4s interval, 0.2s delay)
- **컨테이너**: AI 버블과 동일한 스타일

### Success Feedback
- **체크 아이콘**: 20px 원형, `success/15%` 배경, `check` 아이콘 (success, filled)
- **애니메이션**: pop-in (0.4s ease-out)
- **텍스트**: "등록 완료!" — `--color-success`, semibold
- **서브텍스트**: 등록된 아이템 요약 — `--color-on-surface-variant`

### Action Buttons (확인/수정)
- **등록하기**: Primary Button 스타일, flex-1, 40px 높이, 12px radius
- **수정**: `--color-surface-container-high` 배경, `--color-on-surface-variant` 텍스트, 40px 높이

## 10. Closet Page Entry Point (AI 등록 버튼)

### AI Register Button
- **위치**: 헤더 우측, 기존 "+" 버튼 왼쪽
- **배경**: `--color-primary-fixed` (#D2E4FF)
- **텍스트**: `--color-on-primary-fixed-variant` (#00497E)
- **radius**: full (pill)
- **높이**: 36px
- **패딩**: 0 14px
- **아이콘**: `auto_awesome` (filled, 16px)
- **라벨**: "AI 등록" (14px, semibold)
- **액션**: 채팅 등록 화면으로 이동

## 11. Scrap Layout (F5 코디 추천 비주얼)

### Scrap Container
- **배경**: `--color-surface-container-lowest` (#FFFFFF)
- **radius**: 20px
- **패딩**: 24px
- **shadow**: `0 10px 30px rgba(0,0,0,0.04)`
- **보더**: 1px `outline-variant/10`
- **배경 텍스처**: subtle grid (40px 간격, 3% 불투명도)

### Scrap Item Card
- **배경**: white
- **radius**: 8px
- **패딩**: 16px
- **shadow**: `2px 3px 8px rgba(26,28,31,0.08), 0 1px 2px rgba(26,28,31,0.04)`
- **hover shadow**: `4px 6px 16px rgba(26,28,31,0.12)`
- **기울기**: -2deg ~ 2deg (아이템별 랜덤)
- **배치**: absolute positioning, 비대칭 오버랩
- **내용**:
  - SVG 일러스트 영역 (aspect 4:3, gradient 배경)
  - 색상 도트 (16px) + 카테고리명 (12px bold) + 색상명 (10px)

### Scrap Layout Positioning (수직 착장 순서)
배치 순서는 실제 착장 순서: **위→아래로 아우터 > 상의 > 하의 > 신발**

| 순서 | 아이템 | 정렬 | 너비 | 기울기 | z-index | 텍스트 위치 |
|------|--------|------|------|--------|---------|------------|
| 1 | 아우터 | 좌측 | 60% | -1.5deg | 4 | 카드 우측 |
| 2 | 상의 | 우측 | 55% | +1deg | 3 | 카드 좌측 |
| 3 | 하의 | 좌측 | 52% | -0.5deg | 2 | 카드 우측 |
| 4 | 신발 | 우측 | 48% | +1.5deg | 1 | 카드 좌측 |

- **수직 오버랩**: `space-y-[-16px]` (SVG끼리만 살짝 겹침)
- **텍스트는 오버랩 영역 밖에 배치** — 카드 옆 독립 영역, 항상 가독성 확보
- 좌/우 교차 배치로 비대칭 밸런스
- 악세서리: 메인 의류 흐름 옆에 보조 배치

### Tape Decoration
- **배경**: `primary-fixed` 70% → 40% 불투명도 gradient
- **backdrop-filter**: blur(4px)
- **크기**: 40~48px x 20px
- **위치**: 카드 상단 -8px, 랜덤 수평 위치

### SVG Clothing Illustration
- **뷰포트**: 120x100 (아우터/상의/하의), 120x80 (신발)
- **색상**: `fill` 속성에 user_clothes의 hex 색상 동적 바인딩
- **stroke**: hex 색상의 어두운 변형 (darken 15%)
- **폴백**: SVG 없는 카테고리 → 이모지 (clothing_categories.icon)
- **경로**: `src/assets/clothes/{category-name}.svg`

### Color Palette Preview
- 색상 도트: 20px 원형, 아이템 순서대로 나열
- "Colors" 라벨 (10px, outline, uppercase tracking)
- 색상 조합 설명 텍스트 (10px, outline)

## 12. AI + Manual Divider (모달 내 구분선)

### AI 입력 영역 (모달 상단)
- **입력 필드**: `surface-container-low` 배경, 12px radius, `auto_awesome` 아이콘 (filled)
- **전송 버튼**: 44px 원형, primary 배경
- **파싱 결과**: AI 아바타 (24px, primary-fixed) + 메시지 + Parsed Item Cards
- **되묻기**: Suggestion Chips (섹션 9 참조)
- **등록 확인**: "등록하기" (primary) + "수정" (ghost)

### "또는 직접 선택" 구분선
- **레이아웃**: 좌 hr — 텍스트 — 우 hr
- **hr**: 1px, `outline-variant/40`
- **텍스트**: Caption (12px), `outline`, medium
- **위치**: AI 영역과 수동 선택 영역 사이

## 13. Admin Components (F7 카테고리 관리)

### Admin Badge
- **배경**: `--color-tertiary-fixed` (#FFDEAB)
- **텍스트**: `--color-tertiary` (#7B5500)
- **폰트**: 모바일 10px / 데스크톱 11px, semibold
- **radius**: full (pill)
- **패딩**: 2px 10px
- **위치**: 헤더 우측

### Admin Navigation Tab
- **3번째 탭**: "관리" — `admin_panel_settings` 아이콘
- **admin role일 때만 노출**
- 활성/비활성 스타일은 기존 탭과 동일

### Accordion Panel (Type 그룹)
- **컨테이너**: `--color-surface-lowest` 배경, 모바일 12px / 데스크톱 16px radius
- **shadow**: ambient
- **헤더**: 이모지 + type명 (font semibold) + 개수 뱃지 + "카테고리 추가" 버튼
- **펼침 아이콘**: `expand_more` (펼침) / `chevron_right` (접힘)
- **접힌 상태**: 헤더만 표시, 완전한 rounded
- **펼친 상태**: 헤더 rounded-top + 하위 목록

### Category Row (일반 상태)
- **레이아웃**:
  - 모바일: flex row — 아이콘 + 이름/메타 + 편집/삭제 버튼
  - 데스크톱: grid 5열 — 이름 | 아이콘 | 온도 범위 | 순서 | 작업
- **구분선**: `outline-variant/15` (tonal, "No-Line" 원칙 준수)
- **메타**: 온도 범위 + 순서 (모바일 10px / 데스크톱 12px, outline)
- **hover**: `surface-container-low/30` 배경 (데스크톱)

### Category Row (인라인 편집 모드)
- **배경**: `--color-primary-fixed/20`
- **보더**: `primary/20` 상단
- **입력 필드**: `surface-lowest` 배경, 모바일 8px / 데스크톱 8px radius
  - 이름: text, flex-1 / grid 1열
  - 아이콘: 48px 정사각 (이모지 입력)
  - 온도 min/max: number, 각 56px 너비
  - 순서: number, 48px 너비
- **버튼**: "저장" (primary) + "취소" (surface-container-high)
  - 모바일: flex-1 full width
  - 데스크톱: 인라인 compact

### Delete Confirmation Dialog
- **오버레이**: black/30 + backdrop-blur-sm
- **위치**: 모바일 bottom sheet / 데스크톱 center modal
- **모바일**: rounded-t-2xl, 하단 정렬
- **데스크톱**: rounded-2xl, max-width 420px, 중앙 정렬
- **내용**:
  - 제목: "카테고리 삭제" (Heading, bold)
  - 메시지: "{카테고리명}을 삭제하시겠습니까?"
  - 경고 (조건부): 옷이 있으면 error-container 배경 + warning 아이콘 + "N개의 옷이 함께 삭제됩니다"
  - 버튼: "취소" (surface-container-high) + "삭제" (error 배경)

### Add Type Button (새 상위분류 추가)
- **스타일**: dashed border, `outline-variant/40`
- **텍스트**: `on-surface-variant`, 14px medium
- **아이콘**: `add_circle_outline`
- **hover**: border → primary/30, text → primary
- **위치**: 모바일 전체 너비 / 데스크톱 헤더 우측

## Stitch 참조

### 프로젝트
- ID: `3185131555589405591`

### 컴포넌트별 레퍼런스 스크린
| 영역 | 파일 | Stitch Screen ID |
|------|------|-----------------|
| 전체 디자인 시스템 | `screens/design-system.html` | `5ea05074e4a646978bedf796a772c65c` |
| 버튼 시스템 | `screens/components-buttons.html` | `c93c623467834a98bd6d33d30dfe5b09` |
| 폼 요소 | `screens/components-inputs.html` | `93e797f01d5c4cd88d7ea363bba18150` |
| 카드 시스템 | `screens/components-cards.html` | `a9d66c7f247b4b4fbd29bc641bdca601` |
| 칩 & 네비게이션 | `screens/components-chips-nav.html` | `4852dfbc421b41fa965fa09c38011e6c` |
| 아이콘 & 날씨 | `screens/components-icons.html` | `02993d2df3824b66b386f68b4d65b421` |
| 커스텀 날씨 아이콘 | `screens/components-weather-icons.html` | `f36d016bd2134fe7a2735e3ef8e7e6aa` |

### 화면 스크린
| 화면 | 모바일 | 데스크톱 |
|------|--------|----------|
| 로그인 | `screens/login-screen.html` | `screens/login-screen-desktop.html` |
| 회원가입 | `screens/signup-screen.html` | `screens/signup-screen-desktop.html` |
| 내 옷장 | `screens/closet-page.html` | `screens/closet-page-desktop.html` |
| 옷 등록 모달 | `screens/add-clothing-modal.html` | — |
| 홈 (오늘의 코디) | `screens/home-page.html` | `screens/home-page-desktop.html` |
| AI 채팅 등록 (참고용) | `screens/chat-register.html` | `screens/chat-register-desktop.html` |
| 옷 등록 모달 v2 | `screens/add-clothing-modal-v2.html` | `screens/add-clothing-modal-v2-desktop.html` |
| 홈 v2 (스크랩) | `screens/home-page-v2.html` | `screens/home-page-v2-desktop.html` |
| 코디 스크랩 (참고용) | `screens/outfit-scrap-layout.html` | — |
| Admin 카테고리 관리 | `screens/admin-categories.html` | `screens/admin-categories-desktop.html` |
