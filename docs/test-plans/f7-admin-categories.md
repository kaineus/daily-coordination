# Test Plan — F7. 카테고리 관리 (Admin)

> 작성일: 2026-03-26
> 상태: 완료 (단위+통합 passed)
> 관련: `docs/specs/requirements.md` F7 섹션

---

## 테스트 전략

| 구분 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | admin.service CRUD 함수 |
| 통합 테스트 | Vitest | admin 권한 + CRUD 흐름 |

---

## 1. admin.service — createCategory

### TC-F7-001 전체 필드 입력 → 정상 INSERT
- **우선순위**: P0
- **상태**: passed
- **단계**: createCategory(supabase, { name, type, icon, tempMin, tempMax, sortOrder })
- **기대 결과**: insert 호출 + select().single()

### TC-F7-002 옵션 필드 누락 → 기본값 적용
- **우선순위**: P0
- **상태**: passed
- **단계**: tempMin/tempMax 미전달, icon 빈 문자열
- **기대 결과**: temp_min=null, temp_max=null, icon='', sort_order=0

### TC-F7-003 tempMin=0, tempMax=0 → null이 아닌 0 저장
- **우선순위**: P1
- **상태**: passed
- **기대 결과**: temp_min=0, temp_max=0 (falsy지만 유효 값)

---

## 2. admin.service — updateCategory

### TC-F7-004 단일 필드만 업데이트
- **우선순위**: P0
- **상태**: passed
- **단계**: updateCategory(supabase, id, { name: '새이름' })
- **기대 결과**: payload에 name만 포함

### TC-F7-005 복수 필드 업데이트
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: payload에 name + icon 포함

### TC-F7-006 undefined 필드 → payload에서 제외
- **우선순위**: P0
- **상태**: passed
- **단계**: { name: '새이름', tempMin: undefined }
- **기대 결과**: payload에 temp_min 없음

### TC-F7-007 빈 updates → 빈 payload로 update 호출
- **우선순위**: P1
- **상태**: passed
- **기대 결과**: update({}) 호출

---

## 3. admin.service — deleteCategory

### TC-F7-008 정상 삭제
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: delete().eq('id', id) 호출, error=null

### TC-F7-009 에러 시 error 반환
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: { error } 반환

---

## 4. admin.service — getCategoryClothesCount

### TC-F7-010 옷 3개 있는 카테고리 → 3 반환
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: count === 3

### TC-F7-011 옷 0개 → 0 반환
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: count === 0

### TC-F7-012 쿼리 에러 → 0 반환 (안전 폴백)
- **우선순위**: P0
- **상태**: passed
- **기대 결과**: 0

### TC-F7-013 count null → 0 반환
- **우선순위**: P1
- **상태**: passed
- **기대 결과**: 0 (nullish coalescing)

---

## 5. 통합 — CRUD 흐름

### TC-F7-INT-001 카테고리 추가 → 목록 반영
- **우선순위**: P1
- **상태**: passed
- **단계**: createCategory → getCategories → 새 항목 포함 확인

### TC-F7-INT-002 카테고리 수정 → 변경 반영
- **우선순위**: P1
- **상태**: passed
- **단계**: updateCategory → getCategories → 변경 확인

### TC-F7-INT-003 카테고리 삭제 (옷 있음) → 카운트 확인 후 삭제
- **우선순위**: P1
- **상태**: passed
- **단계**: getCategoryClothesCount → 경고 → deleteCategory

---

## 테스트 파일 구조

```
tests/
├── services/admin.service.test.js    # TC-F7-001~013
└── integration/f7-admin.test.js      # TC-F7-INT-*
```
