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
- **배경**: primary → primary-container 그라데이션 (135deg)
- **텍스트**: white
- **radius**: 16px
- **패딩**: 24px
- **내용**:
  - 위치명 (Caption)
  - 기온 (Display, 28px Bold)
  - 날씨 상태 아이콘 + 텍스트 (Body)
  - 강수 확률 (Caption)

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
- **탭 구성**:
  | 탭 | 아이콘 | 라벨 | 라우트 |
  |-----|--------|------|--------|
  | 코디 | ☀️ (날씨) | 오늘의 코디 | `/` |
  | 옷장 | 👔 (옷) | 내 옷장 | `/closet` |
  | 내정보 | 👤 (프로필) | 내 정보 | `/profile` |
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

## 7. Weather Icons

| 날씨 | 아이콘 | 배경 그라데이션 |
|------|--------|----------------|
| 맑음 | ☀️ | warm yellow → orange |
| 흐림 | ☁️ | light gray → white |
| 비 | 🌧️ | blue → gray |
| 눈 | ❄️ | white → light blue |
| 바람 | 💨 | — |

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

### 화면 스크린
| 화면 | 모바일 | 데스크톱 |
|------|--------|----------|
| 로그인 | `screens/login-screen.html` | `screens/login-screen-desktop.html` |
| 회원가입 | `screens/signup-screen.html` | `screens/signup-screen-desktop.html` |
