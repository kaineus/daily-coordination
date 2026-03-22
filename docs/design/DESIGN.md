# Design System — The Atmospheric Curator

> 날씨 기반 AI 코디 추천 앱 "오늘 뭐 입지?"의 디자인 시스템.
> Stitch MCP로 생성 (프로젝트 ID: `3185131555589405591`)

## 비주얼 테마

**컨셉: The Ethereal Boutique**
- 날씨 앱의 유틸리티 + 패션 룩북의 에디토리얼 감성
- 의도적 비대칭, 요소 오버랩, 고대비 타이포그래피
- "No-Line" 원칙: 구분선 대신 배경색 변화로 영역 구분
- Glassmorphism 활용 (70% 불투명도 + 24px backdrop blur)

## 색상 팔레트

### 브랜드 컬러
| 역할 | 이름 | Hex | CSS 변수 | 용도 |
|------|------|-----|----------|------|
| Primary | Sky Blue | `#005EA1` | `--color-primary` | 주요 버튼, 링크, 강조 |
| Primary Container | Blue | `#2B78BF` | `--color-primary-container` | 그라데이션, 히어로 섹션 |
| Primary Light | Ice Blue | `#D2E4FF` | `--color-primary-fixed` | 선택된 칩, 하이라이트 배경 |
| Secondary | Warm Coral | `#FF6B6B` | `--color-secondary-container` | 액센트, 감성적 CTA |
| Secondary Dark | Deep Red | `#AE2F34` | `--color-secondary` | 경고, 위험 날씨 알림 |
| Tertiary | Amber | `#7B5500` | `--color-tertiary` | 보조 강조 |

### 뉴트럴 (서피스)
| 역할 | Hex | CSS 변수 | 용도 |
|------|-----|----------|------|
| Background | `#F9F9FD` | `--color-background` | 앱 배경 |
| Surface | `#F9F9FD` | `--color-surface` | 기본 서피스 |
| Surface Low | `#F3F3F7` | `--color-surface-low` | 섹션 배경 |
| Surface Container | `#EDEDF1` | `--color-surface-container` | 카드 배경 |
| Surface Lowest | `#FFFFFF` | `--color-surface-lowest` | 최상위 카드 (인터랙티브) |
| On Surface | `#1A1C1F` | `--color-on-surface` | 기본 텍스트 |
| On Surface Variant | `#414751` | `--color-on-surface-variant` | 보조 텍스트 |
| Outline | `#717782` | `--color-outline` | 비활성 아이콘, 힌트 텍스트 |
| Outline Variant | `#C1C7D2` | `--color-outline-variant` | 고스트 보더 (15% 불투명도) |

### 시맨틱
| 역할 | Hex | CSS 변수 |
|------|-----|----------|
| Success | `#4CAF50` | `--color-success` |
| Warning | `#FFC107` | `--color-warning` |
| Error | `#BA1A1A` | `--color-error` |

### 날씨 그라데이션
| 날씨 | 그라데이션 | 각도 |
|------|-----------|------|
| 맑음 (Sunny) | `#FFC107` → `#FF6B6B` | 135deg |
| 흐림 (Cloudy) | `#E8E8EC` → `#FFFFFF` | 135deg |
| 비 (Rainy) | `#005EA1` → `#717782` | 135deg |
| 눈 (Snowy) | `#FFFFFF` → `#D2E4FF` | 135deg |

## 타이포그래피

### 폰트 패밀리
- **헤드라인/디스플레이**: Manrope — 모던, 기하학적 구조
- **본문/타이틀**: Pretendard (한글 최적화), Be Vietnam Pro (영문 폴백)
- **시스템 폴백**: -apple-system, BlinkMacSystemFont, sans-serif

### 타입 스케일
| 레벨 | 크기 | 두께 | 폰트 | 용도 |
|------|------|------|------|------|
| Display | 28px | Bold | Manrope | 기온 표시, 메인 타이틀 |
| Heading 1 | 24px | Bold | Manrope | 페이지 제목 ("내 옷장") |
| Heading 2 | 20px | SemiBold | Manrope | 섹션 제목 ("오늘 날씨") |
| Title | 16px | SemiBold | Pretendard | 카드 제목, 카테고리명 |
| Body Large | 16px | Medium | Pretendard | 강조 본문 |
| Body | 14px | Regular | Pretendard | 기본 본문, AI 추천 텍스트 |
| Caption | 12px | Regular | Pretendard | 부가 정보, 타임스탬프 |

### 타이포 원칙
- 헤드라인에 넓은 letter-spacing으로 "고급스러운" 느낌
- 본문 line-height 1.6으로 여백감 있는 가독성
- 왼쪽 정렬 헤드라인 + 오른쪽 정렬 메타데이터 → 비대칭 밸런스

## 레이아웃 원칙

### 그리드 & 간격 (8px 기반)
| 토큰 | 값 | 용도 |
|------|-----|------|
| spacing-0.5 | 2px | 미세 조정 |
| spacing-1 | 4px | 아이콘 간격 |
| spacing-2 | 8px | 요소 내 간격 |
| spacing-3 | 12px | 컴포넌트 패딩 |
| spacing-4 | 16px | 수평 페이지 패딩 |
| spacing-6 | 24px | 카드 내 섹션 간격 |
| spacing-8 | 32px | 섹션 간 간격 |
| spacing-12 | 48px | 대형 섹션 간격 |

### 모서리 & 그림자
| 토큰 | 값 | 용도 |
|------|-----|------|
| radius-sm | 8px | 인풋, 작은 요소 |
| radius-md | 12px | 카드, 버튼 |
| radius-lg | 16px | 큰 카드, 모달 |
| radius-xl | 24px | 이미지 컨테이너 |
| shadow-ambient | `0 20px 40px rgba(26,28,31,0.06)` | 플로팅 카드 |

### 엘리베이션 (Tonal Layering)
표준 그림자 대신 배경색 레이어링으로 깊이감 표현:
- **Level 0**: `surface` — 기본 바닥
- **Level 1**: `surface-container-low` — 섹션 배경
- **Level 2**: `surface-container-lowest` (#FFFFFF) — 인터랙티브 카드

## Do's and Don'ts

### Do
- 여백을 구조적 요소로 활용 (답답하면 패딩을 spacing-8로)
- 날씨 경고에 `secondary` (#AE2F34) 사용 (패션 액센트처럼)
- 옷 이미지 컨테이너에 radius-xl 사용

### Don't
- 1px solid 구분선 사용 금지 → 배경색 변화로 대체
- 모든 요소 중앙 정렬 금지 → 비대칭 밸런스 활용
- 표준 Drop Shadow 금지 → Tonal Layering 또는 Ambient Shadow 사용
