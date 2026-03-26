# Test Plan — F6. 역할 기반 접근 제어 (RBAC)

> 작성일: 2026-03-26
> 상태: 완료 (단위+통합 passed)
> 관련: `docs/specs/requirements.md` F6 섹션

---

## 테스트 전략

| 구분 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | authStore (role), fetchUserRole, 라우트 가드 |
| 통합 테스트 | Vitest | 로그인 → role fetch → store → 가드 흐름 |
| RLS 테스트 | 수동/Supabase SQL | DB 정책 검증 (E2E 영역) |

---

## 1. authStore — role 상태 관리

### TC-F6-001 setRole('admin')
- **우선순위**: P0
- **상태**: passed
- **단계**: setRole('admin') 호출 → getState().role 확인
- **기대 결과**: role === 'admin'

### TC-F6-002 setRole('user')
- **우선순위**: P0
- **상태**: passed
- **단계**: setRole('user') 호출
- **기대 결과**: role === 'user'

### TC-F6-003 setRole(null) — 로그아웃 시
- **우선순위**: P0
- **상태**: passed
- **단계**: setRole(null) 호출
- **기대 결과**: role === null

### TC-F6-004 clear() → role도 null로 초기화
- **우선순위**: P0
- **상태**: passed
- **단계**: setRole('admin') → clear()
- **기대 결과**: role === null

### TC-F6-005 초기 상태 role === null
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 초기 getState().role === null

---

## 2. fetchUserRole — 서비스 레이어

### TC-F6-006 정상 admin 사용자 → 'admin' 반환
- **우선순위**: P0
- **상태**: passed
- **단계**: getUser() → user 존재 → user_profiles.role = 'admin'
- **기대 결과**: 'admin'

### TC-F6-007 정상 user 사용자 → 'user' 반환
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 'user'

### TC-F6-008 미로그인 (user === null) → 'user' 폴백
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 'user'

### TC-F6-009 user_profiles 조회 에러 → 'user' 폴백
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 'user' + console.error 호출

### TC-F6-010 user_profiles 행 없음 → 'user' 폴백
- **우선순위**: P1
- **상태**: passed
- **기대 결과**: 에러 발생 → 'user'

---

## 3. 라우트 가드 (통합)

### TC-F6-011 admin → /admin/categories 접근 허용
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 리다이렉트 없이 페이지 렌더

### TC-F6-012 user → /admin/categories 접근 → 리다이렉트
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: window.location.hash = '/'

### TC-F6-013 role=null (로딩 중) → /admin/* 접근 → 리다이렉트
- **우선순위**: P1
- **상태**: passed
- **기대 결과**: 리다이렉트 (null !== 'admin')

---

## 테스트 파일 구조

```
tests/
├── stores/auth.store.test.js         # TC-F6-001~005 (기존 + 추가)
├── services/auth.service.test.js     # TC-F6-006~010 (추가)
└── integration/f6-rbac.test.js       # TC-F6-011~013
```
