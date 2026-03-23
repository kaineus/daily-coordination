---
from: PM
to: Developer, Designer
date: 2026-03-22
time: 17:30
---

## 작업 지시: 내 옷장 페이지 (F2) 구현

GNB는 홈(오늘의 코디) + 내 옷장 **2개 탭**으로 구성.
내정보 탭은 제거.

---

### Designer 작업

Stitch MCP로 아래 화면을 생성해주세요:

1. **내 옷장 페이지 (모바일)** → `docs/design/screens/closet-page.html`
   - 상단: "내 옷장" 타이틀 + [+추가] 버튼
   - 그루핑 토글: [카테고리순] [색상별] 칩
   - 카테고리별 그룹 헤더 (🧥 아우터, 👕 상의 등)
   - 각 아이템: closet-item 카드 (색상 도트 + 카테고리명 + 색상명 + 삭제)
   - 빈 상태: "옷장에 옷을 먼저 등록해주세요" + CTA

2. **내 옷장 페이지 (데스크톱)** → `docs/design/screens/closet-page-desktop.html`

3. **옷 등록 모달** → `docs/design/screens/add-clothing-modal.html`
   - 모달 헤더: "옷 등록하기" + 닫기
   - 상위 분류 칩: [아우터][상의][하의][신발][액세서리]
   - 하위 카테고리 칩: 선택된 분류의 세부 카테고리
   - 색상 선택: 13개 프리셋 (components.md 참조)
   - 등록 버튼 (카테고리+색상 선택 시 활성화)

**참조**: `docs/design/DESIGN.md`, `docs/design/components.md`

---

### Developer 작업

#### 1. DB 마이그레이션 적용
- Supabase MCP로 `supabase/migrations/001_init.sql` 적용
- 카테고리 seed 28개 확인

#### 2. 서비스 레이어 (`src/services/closet.service.js` 신규)
```
getCategories() → clothing_categories (sort_order 정렬)
getClothes(userId) → user_clothes JOIN clothing_categories
addClothing({ userId, categoryId, color, colorName })
deleteClothing(id)
```

#### 3. 스토어 (`src/store/closet.store.js` 신규)
- categories, clothes, loading, groupBy ('category' | 'color')

#### 4. 옷 등록 모달 (`src/components/organisms/add-clothing-modal.js` 신규)
- 2단 선택: 상위 분류 → 하위 카테고리
- color-picker 컴포넌트 재사용
- 둘 다 선택 시 등록 버튼 활성화

#### 5. 옷장 페이지 (`src/components/pages/closet-page.js` 신규)
- 카테고리별/색상별 그루핑 토글
- closet-item 컴포넌트 재사용
- 삭제 기능 (dc-delete 이벤트)
- 빈 상태 시 empty-state 표시

#### 6. GNB 수정 (`src/components/templates/app-shell.js`)
- 내정보 탭 제거 → 코디 + 옷장 2탭만
- 현재 라우트에 따라 active 동적 반영

**재사용 컴포넌트**: closet-item, color-picker, empty-state, dc-chip, dc-button
**참조**: `docs/specs/requirements.md` F2 섹션
