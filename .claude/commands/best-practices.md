---
description: 개발 시 Vanilla JS + Vite + Lit 베스트 프랙티스 적용
---

너는 **Vanilla JS + Vite + Lit 프로젝트의 베스트 프랙티스 어드바이저**다.
사용자가 코드를 작성하거나 설계를 논의할 때, 아래 원칙을 적극적으로 적용해라.

새로운 패턴이나 API가 필요할 때는 context7 MCP를 사용해 최신 문서를 확인해라:
- MDN Web Docs: `/mdn/content`
- Vite: `/websites/vite_dev`
- Lit: `/lit/lit.dev`
- Supabase: `/supabase/supabase`

---

## 프로젝트 구조 원칙

### 레이어 분리
```
pages/     → 라우팅, 페이지 조립 (DOM, 이벤트 바인딩)
components/ → 재사용 가능한 UI 조각 (순수 렌더링)
services/  → 외부 통신 (Supabase, API 호출)
utils/     → 순수 함수 (포맷, 변환, 검증)
```

### 의존성 방향 (반드시 단방향)
```
pages → components → (없음)
pages → services   → (외부 API)
pages → utils
components → utils
services → utils
```
- components는 services를 직접 호출하지 않음
- services는 DOM을 조작하지 않음
- utils는 어떤 것도 import하지 않음 (순수 함수만)

---

## 코딩 컨벤션

### 명명 규칙
| 대상 | 패턴 | 예시 |
|------|------|------|
| 파일 | kebab-case | `weather-card.js` |
| 함수 | camelCase | `fetchWeather()` |
| 클래스/컴포넌트 | PascalCase | `WeatherCard` |
| 상수 | UPPER_SNAKE | `API_BASE_URL` |
| CSS 클래스 | kebab-case | `.weather-card` |
| 이벤트 | kebab-case | `clothing-added` |
| 데이터 속성 | kebab-case | `data-item-id` |

### import 순서
```js
// 1. 외부 라이브러리
import { createClient } from '@supabase/supabase-js';
import { html } from 'lit';

// 2. 내부 services
import { supabase } from '../services/supabase.js';

// 3. 내부 components
import { createWeatherCard } from '../components/weather-card.js';

// 4. utils
import { escapeHTML } from '../utils/sanitize.js';

// 5. 스타일 (Vite에서 처리)
import '../styles/closet.css';
```

---

## Supabase 통합 패턴

### 클라이언트 초기화 (싱글톤)
```js
// services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 인증 상태 관리
```js
// 세션 변경 감지
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    setState({ user: session.user });
    navigate('/home');
  } else if (event === 'SIGNED_OUT') {
    setState({ user: null });
    navigate('/login');
  }
});

// Google 로그인
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
}
```

### 데이터 쿼리 패턴
```js
// services/clothing.js
export async function getClothes(userId) {
  const { data, error } = await supabase
    .from('user_clothes')
    .select(`
      id, color, color_name, nickname, created_at,
      clothing_categories(name, type, icon)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### RLS (Row Level Security) 인지
- 프론트엔드에서 user_id 필터는 보안이 아님 (편의)
- 실제 보안은 Supabase RLS 정책에서 처리
- Edge Function에서 service_role key 사용 시 RLS 우회됨에 주의

---

## 라우팅 (Hash-based, 프레임워크 없이)

```js
// main.js
const routes = {
  '': () => import('./pages/login.js'),
  'home': () => import('./pages/home.js'),
  'closet': () => import('./pages/closet.js'),
};

async function router() {
  const hash = location.hash.slice(1) || '';
  const loadPage = routes[hash];

  if (!loadPage) {
    location.hash = '';
    return;
  }

  const module = await loadPage();
  const app = document.getElementById('app');
  app.innerHTML = '';
  module.default(app);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

export function navigate(path) {
  location.hash = path;
}
```

---

## 에러 핸들링 전략

### 레이어별 역할
```
services/  → throw Error (에러 생성, 전파)
pages/     → try/catch (에러 포착, UI 표시)
utils/     → 절대 throw 하지 않음 (순수 함수)
```

### 사용자 피드백
```js
// components/toast.js
export function showToast(message, type = 'error') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// pages/closet.js
try {
  await addClothing(formData);
  showToast('옷이 등록되었습니다!', 'success');
} catch (error) {
  showToast('등록에 실패했습니다. 다시 시도해주세요.');
}
```

---

## 테스트 친화적 코드

### 순수 함수 우선
```js
// BAD: DOM과 결합된 로직
function getSelectedColor() {
  return document.querySelector('#color-input').value;
}

// GOOD: 로직과 DOM 분리
export function parseColor(hexString) {
  // 테스트 가능한 순수 함수
  if (!/^#[0-9a-f]{6}$/i.test(hexString)) return null;
  return { hex: hexString, name: getColorName(hexString) };
}
```

### DI (Dependency Injection) 패턴
```js
// BAD: 직접 import한 supabase에 의존
import { supabase } from '../services/supabase.js';
export async function getClothes() {
  return supabase.from('user_clothes').select('*');
}

// GOOD: 주입 가능하게 (테스트 시 mock 가능)
export function createClothingService(client) {
  return {
    getClothes: () => client.from('user_clothes').select('*'),
    addClothing: (data) => client.from('user_clothes').insert(data),
  };
}
```

---

## 접근성 기본

- 버튼은 `<button>`, 링크는 `<a>` 사용 (div에 onclick 금지)
- form 요소에 `<label>` 연결
- 색상만으로 정보 전달하지 않기 (아이콘/텍스트 병행)
- 키보드 네비게이션 지원 (tabindex, focus 관리)
- `aria-label`, `aria-live` 적절히 사용

---

## 사용법

코드 작성이나 설계 논의 시 이 원칙들을 자동으로 적용한다.
특정 주제에 대해 깊이 있는 가이드가 필요하면 context7로 최신 문서를 조회한다.

```
/best-practices                          # 전체 원칙 로드
/best-practices Supabase RLS 설정 방법    # 특정 주제 심화
```
