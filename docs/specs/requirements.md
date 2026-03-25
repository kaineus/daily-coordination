# Requirements

## F1. Google 로그인
- **우선순위**: P0
- **상태**: ready

### 사용자 스토리
As a 사용자, I want Google 계정으로 로그인, So that 내 옷장 데이터를 저장하고 개인화된 추천을 받을 수 있다.

### 인수 조건
- [ ] Given 미로그인 상태, When Google 로그인 버튼 클릭, Then Supabase Auth로 Google OAuth 인증 후 메인 페이지 이동
- [ ] Given 로그인 상태, When 프로필 영역 확인, Then 이름과 프로필 사진 표시
- [ ] Given 로그인 상태, When 로그아웃 클릭, Then 세션 종료 후 로그인 페이지 이동
- [ ] Given 미로그인 상태, When 메인/옷장 페이지 접근, Then 로그인 페이지로 리다이렉트

### 기술 참고
- Supabase Auth + Google OAuth Provider
- `@supabase/supabase-js` 사용

---

## F2. 옷 등록 (카테고리 + 색상)
- **우선순위**: P0
- **상태**: ready

### 사용자 스토리
As a 사용자, I want 내가 가진 옷을 카테고리와 색상으로 등록, So that AI가 내 옷장을 기반으로 코디를 추천할 수 있다.

### 인수 조건
- [ ] Given 옷장 페이지, When 카테고리 선택 + 색상 선택 + 등록 버튼, Then user_clothes 테이블에 저장
- [ ] Given 옷장 페이지, When 목록 조회, Then 카테고리별로 그룹화된 옷 목록 표시 (카테고리명 + 색상)
- [ ] Given 등록된 옷, When 삭제 버튼 클릭, Then 해당 항목 삭제
- [ ] Given 옷 등록 폼, When 색상 선택, Then 컬러 프리셋 또는 컬러피커로 hex 코드 + 색상명 저장

### 카테고리 상위 분류
- 아우터: 패딩, 코트, 자켓, 가디건, 바람막이, 점퍼
- 상의: 반팔티, 긴팔티, 맨투맨, 후드, 니트, 셔츠, 블라우스
- 하의: 청바지, 슬랙스, 면바지, 기모바지, 반바지, 치마
- 신발: 운동화, 구두, 부츠, 샌들, 슬리퍼
- 액세서리: 모자, 목도리, 장갑, 우산

### 색상 프리셋 (25개)

#### 기본 (6)
| 이름 | Hex |
|------|-----|
| 검정 | #333333 |
| 흰색 | #FFFFFF |
| 아이보리 | #FFFFF0 |
| 회색 | #808080 |
| 차콜 | #555555 |
| 크림 | #FFFDD0 |

#### 브라운 계열 (4)
| 이름 | Hex |
|------|-----|
| 베이지 | #F5E6D3 |
| 브라운 | #4B3621 |
| 카키 | #8B7D5B |
| 올리브 | #6B8E23 |

#### 블루 계열 (4)
| 이름 | Hex |
|------|-----|
| 네이비 | #1E3A8A |
| 파랑 | #4488FF |
| 스카이블루 | #87CEEB |
| 데님 | #1560BD |

#### 레드 계열 (4)
| 이름 | Hex |
|------|-----|
| 빨강 | #FF4444 |
| 버건디 | #800020 |
| 와인 | #722F37 |
| 코랄 | #FF7F7F |

#### 기타 (7)
| 이름 | Hex |
|------|-----|
| 분홍 | #FF88AA |
| 라벤더 | #B4A7D6 |
| 민트 | #34D399 |
| 초록 | #44BB44 |
| 노랑 | #FFCC00 |
| 머스타드 | #E1AD01 |
| 주황 | #FF8844 |

> F4 자연어 등록에서는 프리셋에 없는 색상도 AI가 hex 매핑 가능

### 기술 참고
- 카테고리는 clothing_categories 테이블에 사전 정의 (seed)
- 관리자 UI 없이 Supabase 대시보드에서 카테고리 관리
- 색상: hex 코드 + 색상명 저장

---

## F3. 날씨 기반 AI 코디 추천
- **우선순위**: P0
- **상태**: in-progress

### 사용자 스토리
As a 사용자, I want 오늘 날씨에 맞는 코디를 AI가 추천, So that 매일 아침 옷 고르는 고민을 줄일 수 있다.

### 홈 화면 구성 (위에서 아래 순서)

#### 1. AI 코디 추천 (최상단 — 가장 먼저 보여줌)
- [ ] Given 옷장에 옷이 있을 때, When 페이지 로드, Then AI가 기온 기반 코디 추천 카드 표시
- [ ] Given 추천 카드, When 표시, Then 아우터/상의/하의/신발 각각 **상위분류(type) + 카테고리명 + 색상** + 추천 이유
- [ ] Given 추천 카드, When 표시, Then AI 요약 (summary) + 팁 (tip)
- [ ] Given 추천 카드, When "다른 코디" 버튼 클릭, Then 새로운 코디 조합 생성
- [ ] Given 옷장 비어있을 때, When 페이지 로드, Then "옷장에 옷을 먼저 등록해주세요" + 링크

#### 2. 오늘의 날씨 요약
- [ ] Given 메인 페이지, When 로드, Then 현재 기온 + 하늘상태 아이콘 + 최저/최고 기온 표시
- [ ] Given 메인 페이지, When 로드, Then 강수확률 + 풍속 표시
- [ ] Given 날씨 데이터, When 하늘상태 확인, Then 맑음/구름많음/흐림/비/눈 아이콘 및 배경 변경

#### 3. 시간대별 날씨 차트
- [ ] Given 메인 페이지, When 로드, Then 3시간 간격 시간대별 날씨 표시 (가로 스크롤)
- [ ] Given 시간대별 데이터, When 표시, Then 각 시간: 시각 + 하늘상태 아이콘 + 기온 + 풍속
- [ ] Given 시간대별 데이터, When 표시, Then 기온 변화를 시각적으로 표현 (높이 차이 또는 라인)

### 하늘상태 매핑
| 기상청 코드 | 상태 | 아이콘 | 배경 그라데이션 |
|------------|------|--------|----------------|
| SKY=1 | 맑음 | ☀️ | #FFC107 → #FF6B6B |
| SKY=3 | 구름많음 | ⛅ | #E8E8EC → #FFFFFF |
| SKY=4 | 흐림 | ☁️ | #C1C7D2 → #E8E8EC |
| PTY=1 | 비 | 🌧️ | #005EA1 → #717782 |
| PTY=3 | 눈 | ❄️ | #FFFFFF → #D2E4FF |
| PTY=2 | 비/눈 | 🌨️ | #005EA1 → #D2E4FF |

### 기술 참고
- 기상청 단기예보 API (Supabase Edge Function에서 프록시)
- 기상청 응답 카테고리: TMP(기온), TMN(최저), TMX(최고), SKY(하늘상태), PTY(강수형태), POP(강수확률), WSD(풍속)
- Gemini API (Edge Function) — **온도 기반**으로 코디 추천
- 추천 결과는 recommendations 테이블에 저장 (날짜별 캐시)

### Gemini 프롬프트 핵심 규칙
- **온도만 고려**하여 추천 (프로토타입)
- 반드시 사용자 보유 옷에서만 선택
- clothing_categories의 temp_min/temp_max 범위 참고
- 색상 조합은 무난하게 (보색 회피, 유사톤 우선)
- 추천 이유를 친근하게 한국어로 설명

---

## DB 스키마

### clothing_categories
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| name | text | 카테고리명 (패딩, 청바지 등) |
| type | text | 상위 분류 (아우터/상의/하의/신발/액세서리) |
| temp_min | int | 적합 최저기온 (nullable) |
| temp_max | int | 적합 최고기온 (nullable) |
| icon | text | 아이콘 이모지 |
| sort_order | int | 정렬 순서 |

### user_clothes
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| category_id | uuid FK → clothing_categories | |
| color | text | hex 색상 코드 |
| color_name | text | 색상 이름 |
| nickname | text | 별명 (선택) |
| created_at | timestamptz | |

### recommendations
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| date | date | 추천 날짜 |
| weather_data | jsonb | 날씨 정보 |
| a2ui_json | jsonb | A2UI JSON |
| created_at | timestamptz | |

---

## F4. 자연어 옷 등록 (AI Chat)
- **우선순위**: P1
- **상태**: draft

### 사용자 스토리
As a 사용자, I want 자연어로 옷을 등록, So that 카테고리/색상을 일일이 선택하지 않고 빠르게 등록할 수 있다.

### 핵심 컨셉
- 기존 수동 등록(F2 모달)은 **유지** — 자연어 등록은 **추가 진입점**
- 자연어 입력 → Gemini가 파싱 → 카테고리/색상 매칭 → 등록
- 한 번에 여러 벌 등록 가능 ("검정 패딩이랑 네이비 슬랙스")
- 애매한 입력은 AI가 되물어봄

### 인수 조건

#### 입력 및 파싱
- [ ] Given 자연어 입력창, When "검정 패딩 등록해줘" 입력, Then Gemini가 카테고리(패딩) + 색상(검정/#333333) 파싱
- [ ] Given 자연어 입력, When "베이지 니트랑 네이비 슬랙스" 입력, Then 2개 아이템을 각각 파싱하여 등록
- [ ] Given 자연어 입력, When 카테고리 특정 불가 ("갈색 옷"), Then AI가 "어떤 종류의 옷인가요? (코트, 자켓, 니트...)" 되물음
- [ ] Given 자연어 입력, When 색상 특정 불가 ("패딩 등록해줘"), Then AI가 "무슨 색인가요?" 되물음
- [ ] Given 자연어 입력, When 카테고리 목록에 없는 옷 ("한복"), Then AI가 가장 유사한 카테고리를 제안

#### 등록 확인
- [ ] Given AI 파싱 완료, When 결과 표시, Then 파싱된 카테고리명 + 색상 미리보기 표시
- [ ] Given 파싱 결과, When 사용자가 확인, Then user_clothes에 저장 (기존 addClothing 서비스 재사용)
- [ ] Given 파싱 결과, When 사용자가 수정 요청 ("색상은 네이비로 바꿔"), Then 수정 반영 후 재확인

#### 대화 흐름
- [ ] Given 등록 완료 후, When 대화 지속, Then 추가 등록 가능한 상태 유지
- [ ] Given 대화 중, When 옷 등록과 무관한 입력, Then 부드럽게 옷 등록 안내로 유도

### UI 요구사항
- **기존 등록 모달 상단에 자연어 입력 필드 추가** (별도 화면 아님)
- 수동 선택과 자연어 입력이 같은 모달 안에 공존
- AI 파싱 결과는 모달 내에 카드 형태로 표시 (카테고리 아이콘 + 색상 도트 + 이름)
- 되묻기 시 선택지를 칩(Chip)으로 제시
- 기존 디자인 시스템 (The Ethereal Boutique) 톤 유지

### 기술 참고
- AI 엔진: Gemini API (기존 Edge Function 패턴 활용, 새 함수 `chat-register`)
- 파싱 대상: clothing_categories 테이블 30개 카테고리 + 13개 프리셋 색상 + 자유 색상명
- DB 변경: 없음 (기존 user_clothes 테이블 그대로 사용)
- 프론트 서비스: 기존 `closet.service.js`의 addClothing() 재사용
- 사진 등록: 향후 확장 (현재 스코프 외)

### Gemini 프롬프트 핵심 규칙
- 사용자 입력에서 **카테고리명**과 **색상명**을 추출
- clothing_categories 목록을 컨텍스트로 제공하여 정확한 매칭
- 색상은 프리셋 13개 우선 매칭, 없으면 가장 가까운 프리셋 제안
- 복수 아이템 파싱 지원
- 불확실하면 되물음 (hallucination 방지)
- 응답 형식: 구조화된 JSON + 사용자 친화적 메시지

---

## F5. 코디 추천 비주얼 업그레이드 (매거진 스크랩 스타일)
- **우선순위**: P2
- **상태**: draft

### 사용자 스토리
As a 사용자, I want 코디 추천 결과를 매거진 스크랩처럼 시각적으로, So that 추천 결과가 더 직관적이고 감성적으로 느껴진다.

### 핵심 컨셉
- 현재 이모지 + 텍스트 리스트 → **SVG 일러스트 + CSS 스크랩 레이아웃**으로 교체
- 카테고리별 SVG 일러스트 (30개) + CSS fill로 색상 동적 적용
- 패션 잡지의 옷 오려붙인 느낌 (기울기, 오버랩, 자연스러운 그림자)

### 인수 조건
- [ ] Given 코디 추천 결과, When 화면 표시, Then 각 아이템이 SVG 일러스트 + 사용자 색상으로 표시
- [ ] Given 추천 아이템들, When 레이아웃 배치, Then 위→아래 착장 순서 (아우터 > 상의 > 하의 > 신발)
- [ ] Given 추천 아이템들, When 레이아웃 배치, Then SVG끼리 살짝 오버랩 (스크랩 감성), 단 핵심 실루엣은 가리지 않음
- [ ] Given 추천 아이템, When 텍스트 표시, Then 카테고리명 + 색상명은 오버랩 영역 밖에 배치 (항상 가독성 확보)
- [ ] Given 악세서리 아이템, When 레이아웃 배치, Then 메인 의류 흐름 옆에 보조 배치
- [ ] Given SVG 일러스트, When 색상 적용, Then user_clothes의 color(hex)를 SVG fill로 동적 매핑
- [ ] Given SVG 없는 카테고리, When 표시, Then 기존 이모지 아이콘으로 폴백
- [ ] Given 옷장 페이지, When 아이템 표시, Then 동일 SVG + 색상으로 일관된 비주얼

### SVG 에셋 계획
- 소스: 오픈소스 SVG 라이브러리 (SVGRepo, Lucide 등) + 필요시 커스텀 제작
- 카테고리 30개에 대응하는 단색 SVG 일러스트
- 경로: `src/assets/clothes/{category-name}.svg`
- 색상은 CSS `fill` 또는 `filter`로 런타임 변경

### 기술 참고
- DB 변경: 없음
- clothing_categories.icon (이모지) → SVG 매핑 테이블 추가 (프론트 상수)
- CSS: transform rotate, z-index 레이어링, box-shadow로 스크랩 느낌

---

## 페이지 구성

### 1. 랜딩/로그인 페이지
- 앱 소개 + Google 로그인 버튼

### 2. 메인 (오늘의 코디) 페이지
- 날씨 요약
- A2UI 코디 추천 카드
- "다른 코디" 버튼

### 3. 내 옷장 페이지
- 카테고리별 옷 목록
- 옷 추가 폼 (카테고리 + 색상)
- 옷 삭제
