---
from: developer
to: tester
date: 2026-03-26
time: 14:00
priority: P0
---

## 변경 사항
- F6 RBAC 구현 완료 (DB + 프론트)
- F7 카테고리 관리 Admin 페이지 구현 완료

## 구현 상세

### F6 RBAC
- **DB**: `user_profiles` 테이블, 신규 가입 트리거, RLS 정책 (admin만 카테고리 CUD)
- **authStore**: `role` 필드 + `setRole` 액션
- **auth.service**: `fetchUserRole()` — 로그인 시 role fetch
- **dc-app.js**: `/admin/*` 가드 (role !== 'admin' → 리다이렉트)
- **app-shell.js**: admin일 때 3번째 탭 "관리" 노출 (모바일 + 데스크톱)

### F7 카테고리 관리
- **admin.service.js**: createCategory, updateCategory, deleteCategory, getCategoryClothesCount
- **admin-categories-page.js**: `/admin/categories`
  - type별 아코디언 (펼침/접힘)
  - 인라인 편집 모드 (이름/아이콘/온도범위/순서)
  - 삭제 확인 다이얼로그 (옷 있으면 경고)
  - 카테고리 추가 / 새 상위분류 추가
  - 모바일 + 데스크톱 반응형

### DB 변경사항
- `user_profiles` 테이블 신규
- `clothing_categories` type CHECK 제약 제거 (새 상위분류 지원)
- `user_clothes` FK ON DELETE: RESTRICT → CASCADE

### 테스트 계정
- admin: `kaineus86@gmail.com`
- 나머지 계정은 role = 'user'

## 다음 작업 지시
- `docs/test-plans/f6-rbac.md`, `docs/test-plans/f7-admin-categories.md` 기반 테스트 실행
- 특히 RLS 정책 테스트 (user 계정으로 카테고리 CUD 시도 → 거부 확인)

### 참고
- `docs/specs/requirements.md` — F6, F7 인수 조건
