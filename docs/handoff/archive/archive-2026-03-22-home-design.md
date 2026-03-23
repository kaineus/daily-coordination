---
from: PM
to: Developer, Designer
date: 2026-03-22
time: 18:15
---

## 작업 지시: F3 날씨 기반 AI 코디 추천 구현

A2UI는 프로토타입에서 제외. Gemini JSON → 기존 outfit-card 렌더링 방식.

---

### Designer 작업

Stitch MCP로 홈 페이지 화면을 생성해주세요.

#### 홈 페이지 모바일 (`docs/design/screens/home-page.html`)
구성:
1. **날씨 카드** — 날씨 타입별 그라데이션 배경 (DESIGN.md 날씨 그라데이션 참조)
   - 위치명, 기온 (Display 28px), 날씨 아이콘, 강수확률
2. **"오늘의 코디" 섹션 타이틀** (Heading 2)
3. **코디 추천 카드**
   - 상단: AI 요약 텍스트 (Heading 2, 큰 타이포)
   - 컬러 팔레트: 추천된 옷들의 색상 도트를 나란히 (전체 색감 한눈에)
   - 아이템 리스트 (closet-item 스타일):
     - 각 아이템: 아이콘 + 카테고리명 + 색상 도트 + 색상명
     - 아래에 추천 이유 텍스트 (Caption, on-surface-variant)
   - AI 팁: surface-container-low 배경, 💡 아이콘
   - "다른 코디 추천" 버튼 (Accent 스타일 #FF6B6B)
4. **빈 상태**: 옷장 비어있을 때 → empty-state + 옷장 링크

#### 홈 페이지 데스크톱 (`docs/design/screens/home-page-desktop.html`)
- 좌측: 날씨 카드 (고정)
- 우측: 코디 추천 카드 (넓게)

**참조**: `docs/design/DESIGN.md`, `docs/design/components.md` (Weather Card, Outfit Card 섹션)

---

### Developer 작업

#### 환경변수 설정 (먼저 수행)
Supabase Edge Function secrets:
```
GEMINI_API_KEY=(Supabase Secrets에서 관리)
KMA_API_KEY=(Supabase Secrets에서 관리)
```

#### 1. Edge Function: weather (`supabase/functions/weather/index.ts`)
- 기상청 단기예보 API, nx=60 ny=127 (서울 중구)
- 기온/강수확률/강수형태/풍속 추출 → JSON 반환

#### 2. Edge Function: recommend (`supabase/functions/recommend/index.ts`)
- 캐시 확인 → 없으면 weather + 옷장 조회 → Gemini 호출 → 저장
- `?refresh=true`로 다른 코디 요청

#### 3. Gemini 프롬프트
패션 코디네이터 AI, 보유 옷에서만 선택, 색상 조합 고려, 친근한 추천 이유.
응답: items[], accessories[], summary, tip

#### 4. 프론트엔드
- `src/services/recommend.service.js` (신규)
- `src/store/recommend.store.js` (신규)
- `src/components/pages/home-page.js` (신규)
- `dc-app.js` "/" 라우트 교체

#### 구현 순서
1. secrets 설정 → 2. weather EF → 3. recommend EF → 4. 서비스/스토어 → 5. home-page → 6. 라우트
