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

### 기술 참고
- 카테고리는 clothing_categories 테이블에 사전 정의 (seed)
- 관리자 UI 없이 Supabase 대시보드에서 카테고리 관리
- 색상: hex 코드 + 색상명 저장

---

## F3. 날씨 기반 AI 코디 추천 (A2UI)
- **우선순위**: P0
- **상태**: ready

### 사용자 스토리
As a 사용자, I want 오늘 날씨에 맞는 코디를 AI가 추천, So that 매일 아침 옷 고르는 고민을 줄일 수 있다.

### 인수 조건
- [ ] Given 메인 페이지, When 페이지 로드, Then 오늘 날씨 요약 표시 (기온, 날씨 상태, 강수 확률)
- [ ] Given 옷장에 등록된 옷이 있을 때, When 페이지 로드, Then AI가 날씨 + 옷장 기반 코디 추천 카드 표시 (A2UI)
- [ ] Given 추천 카드, When "다른 코디" 버튼 클릭, Then 새로운 코디 조합 생성
- [ ] Given 추천 카드, When 표시, Then 아우터/상의/하의/신발 각각 카테고리명 + 색상 + 추천 이유 표시
- [ ] Given 옷장이 비어있을 때, When 페이지 로드, Then "옷장에 옷을 먼저 등록해주세요" 안내 + 옷장 페이지 링크

### 기술 참고
- 기상청 단기예보 API (Supabase Edge Function에서 프록시)
- Gemini API로 A2UI v0.9 JSON 생성 (Edge Function)
- A2UI Lit 렌더러로 브라우저에서 네이티브 렌더링
- 추천 결과는 recommendations 테이블에 저장

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
