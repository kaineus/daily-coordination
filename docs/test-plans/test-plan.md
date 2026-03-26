# Test Plan — Daily Coordination v0.2.0

> 작성일: 2026-03-22 (업데이트: 2026-03-26)
> 대상: F1 (Google 로그인), F2 (옷 등록), F3 (날씨 기반 AI 코디 추천)

---

## 실행 결과 요약 (2026-03-26)

| 레이어 | 파일 수 | TC 수 | 상태 | Stmts | Lines |
|--------|---------|-------|------|-------|-------|
| constants | 4 | 36 | **passed** | 100% | 100% |
| router | 1 | 9 | **passed** | 100% | 100% |
| services | 4 | 19 | **passed** | 93% | 98% |
| stores | 6 | 37 | **passed** | 100% | 100% |
| utils | 5 | 30 | **passed** | 100% | 100% |
| edge-functions | 1 | 11 | **passed** | — | — |
| **전체** | **21** | **187** | **all passed** | **98%** | **99%** |

---

## 테스트 전략

### 도구
| 구분 | 도구 | 대상 | 상태 |
|------|------|------|------|
| 단위 테스트 | Vitest | utils, stores, services, constants, router | **완료** |
| Edge Function | Vitest (로직 복제) | chat-register 파싱 로직 | **완료** |
| 컴포넌트 테스트 | Vitest + @open-wc/testing | Lit 컴포넌트 | 보류 (프로토타입 단계) |
| E2E 테스트 | Playwright | 전체 사용자 흐름 | 보류 (구현 완료 후) |

### 우선순위
1. **P0**: 순수 함수 (utils) — ✅ 완료 (100%)
2. **P0**: 상태 관리 (stores) — ✅ 완료 (100%)
3. **P0**: 상수 (constants) — ✅ 완료 (100%)
4. **P1**: 서비스 레이어 (services) — ✅ 완료 (93%)
5. **P1**: 라우터 — ✅ 완료 (100%)
6. **P1**: Edge Function 파싱 로직 — ✅ 완료
7. **P3**: Lit 컴포넌트 — 보류
8. **P3**: E2E — 보류

---

## F1. Google 로그인 테스트

### TC-F1-001 Google OAuth 로그인 호출
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 클라이언트 모킹
- **단계**:
  1. signInWithGoogle(mockSupabase) 호출
  2. supabase.auth.signInWithOAuth가 provider: 'google'로 호출되는지 확인
- **기대 결과**: signInWithOAuth({ provider: 'google' }) 호출됨

### TC-F1-002 로그아웃
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 클라이언트 모킹
- **단계**:
  1. signOut(mockSupabase) 호출
- **기대 결과**: supabase.auth.signOut() 호출됨

### TC-F1-003 Auth 상태 변경 콜백
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 클라이언트 모킹
- **단계**:
  1. initAuth(mockSupabase, onSessionChange) 호출
  2. onAuthStateChange 리스너의 콜백 트리거
- **기대 결과**: onSessionChange가 세션 데이터와 함께 호출됨

### TC-F1-004 Auth Store 세션 설정
- **우선순위**: P0
- **상태**: passed
- **사전조건**: authStore 초기 상태
- **단계**:
  1. authStore.getState().setSession(mockSession) 호출
  2. store 상태 확인
- **기대 결과**: user, session 필드가 올바르게 설정됨

### TC-F1-005 Auth Store 세션 클리어
- **우선순위**: P0
- **상태**: passed
- **사전조건**: authStore에 세션 설정 완료
- **단계**:
  1. authStore.getState().clear() 호출
- **기대 결과**: user=null, session=null, loading=false, error=null

### TC-F1-006 미로그인 시 보호 페이지 접근 제한
- **우선순위**: P2 (E2E)
- **상태**: passed
- **사전조건**: 미로그인 상태
- **단계**:
  1. 메인 페이지 URL 직접 접근
- **기대 결과**: 로그인 페이지로 리다이렉트

---

## F2. 옷 등록 테스트

### TC-F2-001 Closet Store — 카테고리 설정
- **우선순위**: P0
- **상태**: passed
- **사전조건**: closetStore 초기 상태
- **단계**:
  1. setCategories(mockCategories) 호출
- **기대 결과**: categories 배열이 설정됨

### TC-F2-002 Closet Store — 옷 추가
- **우선순위**: P0
- **상태**: passed
- **사전조건**: closetStore에 clothes 비어있음
- **단계**:
  1. addItem(mockClothingItem) 호출
- **기대 결과**: clothes 배열에 아이템 추가됨

### TC-F2-003 Closet Store — 옷 삭제
- **우선순위**: P0
- **상태**: passed
- **사전조건**: closetStore에 옷 1개 등록
- **단계**:
  1. removeItem(itemId) 호출
- **기대 결과**: 해당 아이템이 clothes에서 제거됨

### TC-F2-004 카테고리별 그루핑
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 여러 카테고리의 옷 데이터
- **단계**:
  1. groupByCategory(clothes) 호출
- **기대 결과**: TYPE_ORDER 순서대로 그룹화된 결과 반환

### TC-F2-005 카테고리별 그루핑 — 필터 적용
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 여러 카테고리의 옷 데이터
- **단계**:
  1. groupByCategory(clothes, '상의') 호출
- **기대 결과**: 상의 카테고리만 포함된 결과

### TC-F2-006 카테고리별 그루핑 — 빈 배열
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. groupByCategory([]) 호출
- **기대 결과**: 빈 배열 반환

### TC-F2-007 색상별 그루핑
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 다양한 색상의 옷 데이터
- **단계**:
  1. groupByColor(clothes) 호출
- **기대 결과**: 색상명 기준으로 그룹화, 각 그룹에 hex 값 포함

### TC-F2-008 Closet Service — 카테고리 조회
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 모킹
- **단계**:
  1. getCategories(mockSupabase) 호출
- **기대 결과**: sort_order로 정렬된 카테고리 배열 반환

### TC-F2-009 Closet Service — 옷 등록
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 모킹, 세션 있음
- **단계**:
  1. addClothing(mockSupabase, { categoryId, color, colorName }) 호출
- **기대 결과**: insert가 올바른 데이터로 호출됨

### TC-F2-010 Closet Service — 미로그인 시 등록 실패
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 모킹, 세션 없음
- **단계**:
  1. addClothing(mockSupabase, data) 호출
- **기대 결과**: 에러 발생 또는 적절한 실패 처리

### TC-F2-011 Closet Service — 옷 삭제
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Supabase 모킹
- **단계**:
  1. deleteClothing(mockSupabase, itemId) 호출
- **기대 결과**: delete 쿼리가 해당 ID로 호출됨

---

## F3. 날씨 기반 AI 코디 추천 테스트

### TC-F3-001 Recommend Store — 날씨 데이터 설정
- **우선순위**: P0
- **상태**: passed
- **사전조건**: recommendStore 초기 상태
- **단계**:
  1. setWeather(mockWeatherData) 호출
- **기대 결과**: weather 설정 + hourly 배열 파생됨

### TC-F3-002 Recommend Store — 추천 데이터 설정
- **우선순위**: P0
- **상태**: passed
- **사전조건**: recommendStore 초기 상태
- **단계**:
  1. setRecommendation(mockRecommendation) 호출
- **기대 결과**: recommendation 필드 설정됨

### TC-F3-003 Recommend Store — 클리어
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 데이터가 설정된 store
- **단계**:
  1. clear() 호출
- **기대 결과**: 모든 필드 초기값으로 리셋

### TC-F3-004 추천 아이템 정규화
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. normalizeOutfitItems(mockRecommendation) 호출
- **기대 결과**: items + accessories가 하나의 배열로 병합, 프로퍼티명 매핑 정확

### TC-F3-005 추천 아이템 정규화 — null 입력
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. normalizeOutfitItems(null) 호출
- **기대 결과**: 빈 배열 반환 (에러 없음)

### TC-F3-006 날씨 차트 SVG 경로 생성
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. buildBezierPath([5, 8, 12, 10, 7]) 호출
- **기대 결과**: path, fillPath, points, minT, maxT, range, ySteps 포함 객체 반환

### TC-F3-007 날씨 차트 — 동일 온도
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. buildBezierPath([10, 10, 10]) 호출
- **기대 결과**: 수평선 경로 생성, range=0 처리 (0 나누기 방지)

### TC-F3-008 날씨 차트 — 단일 값
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. buildBezierPath([15]) 호출
- **기대 결과**: 에러 없이 결과 반환

### TC-F3-009 날씨 차트 — 음수 온도
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. buildBezierPath([-5, -2, 0, 3]) 호출
- **기대 결과**: 음수 포함 범위 정상 계산

### TC-F3-010 Recommend Service — 날씨 조회
- **우선순위**: P1
- **상태**: passed
- **사전조건**: fetch 모킹, import.meta.env 설정
- **단계**:
  1. getWeather() 호출
- **기대 결과**: edge function /weather 엔드포인트 호출, 결과 반환

### TC-F3-011 Recommend Service — AI 추천 조회
- **우선순위**: P1
- **상태**: passed
- **사전조건**: fetch 모킹, Supabase 세션 있음
- **단계**:
  1. getRecommendation(mockSupabase) 호출
- **기대 결과**: /recommend 엔드포인트에 인증 토큰과 함께 호출

### TC-F3-012 Recommend Service — 새로고침 추천
- **우선순위**: P1
- **상태**: passed
- **사전조건**: fetch 모킹, Supabase 세션 있음
- **단계**:
  1. getRecommendationWithRefresh(mockSupabase) 호출
- **기대 결과**: ?refresh=true 쿼리 파라미터 포함 호출

---

## 공통 유틸리티 테스트

### TC-UTIL-001 흰색 판별
- **우선순위**: P0
- **상태**: passed
- **사전조건**: 없음
- **단계**:
  1. isWhiteColor('#ffffff') → true
  2. isWhiteColor('#FFFFFF') → true
  3. isWhiteColor('#000000') → false
  4. isWhiteColor(null) → false
- **기대 결과**: 위 결과와 일치

### TC-UTIL-002 KST 시간 계산
- **우선순위**: P1
- **상태**: passed
- **사전조건**: Date.now() 모킹
- **단계**:
  1. getKSTHour() 호출
- **기대 결과**: UTC+9 기준 현재 시간(0-23) 반환

---

## 라우터 테스트

### TC-ROUTER-001 해시 라우팅 매칭
- **우선순위**: P2
- **상태**: passed
- **사전조건**: HashRouter 인스턴스, mock host
- **단계**:
  1. window.location.hash = '#/closet' 설정
  2. current 프로퍼티 확인
- **기대 결과**: closet 라우트 매칭

### TC-ROUTER-002 navigate 메서드
- **우선순위**: P2
- **상태**: passed
- **사전조건**: HashRouter 인스턴스
- **단계**:
  1. navigate('/home') 호출
- **기대 결과**: window.location.hash가 '#/home'으로 변경, host.requestUpdate() 호출

---

## 테스트 인프라 (설정 완료)

### 패키지
`vitest`, `@vitest/coverage-v8`, `jsdom` — devDependencies에 설치 완료

### 명령어
| 명령어 | 설명 |
|--------|------|
| `npm test` | 전체 테스트 실행 |
| `npm run test:watch` | 워치 모드 |
| `npm run test:coverage` | 커버리지 리포트 |

### 파일 구조
```
tests/
├── constants/
│   ├── clothing.test.js
│   ├── colors.test.js
│   ├── svg-map.test.js
│   └── weather.test.js
├── edge-functions/
│   └── chat-register.test.js
├── router/
│   └── routes.test.js
├── services/
│   ├── auth.service.test.js
│   ├── chat.service.test.js
│   ├── closet.service.test.js
│   └── recommend.service.test.js
├── stores/
│   ├── auth.store.test.js
│   ├── chat.store.test.js
│   ├── closet.store.test.js
│   ├── create-store.test.js
│   ├── recommend.store.test.js
│   └── store-controller.test.js
└── utils/
    ├── closet-grouping.test.js
    ├── color.test.js
    ├── recommendation.test.js
    ├── timezone.test.js
    └── weather-chart.test.js
```

---

## 커버리지 달성 현황
| 레이어 | 목표 | 달성 (Stmts) | 달성 (Lines) |
|--------|------|-------------|-------------|
| Constants | 100% | **100%** | **100%** |
| Router | 90%+ | **100%** | **100%** |
| Utils | 90%+ | **100%** | **100%** |
| Stores | 80%+ | **100%** | **100%** |
| Services | 60%+ | **93%** | **98%** |
| Components | - | 보류 | 보류 |
| E2E | - | 보류 | 보류 |
