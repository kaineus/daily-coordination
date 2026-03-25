# Gemini 이미지 생성 PoC 결과 보고서

**일시**: 2026-03-25
**작성자**: Developer

---

## 1. API 가용성 확인

### 사용 가능한 이미지 생성 모델

| 모델 | API 방식 | 무료 플랜 | 유료 플랜 |
|------|---------|----------|----------|
| `gemini-2.5-flash-image` | generateContent (responseModalities: IMAGE) | ❌ 쿼터 0 | ✅ 사용 가능 |
| `gemini-3-pro-image-preview` | generateContent | 미확인 (쿼터 소진) | ✅ 사용 가능 추정 |
| `gemini-3.1-flash-image-preview` | generateContent | 미확인 (쿼터 소진) | ✅ 사용 가능 추정 |
| `imagen-4.0-generate-001` | predict | ❌ 유료 전용 | ✅ |
| `imagen-4.0-ultra-generate-001` | predict | ❌ 유료 전용 | ✅ |
| `imagen-4.0-fast-generate-001` | predict | ❌ 유료 전용 | ✅ |

### 핵심 발견

- **`gemini-2.5-flash-image`**: 모델 자체는 존재하고 API 호출 구조도 확인됨. 단, **무료 플랜의 이미지 생성 쿼터가 `limit: 0`** — 즉, 무료에서는 이미지 생성 자체가 불가
- **Imagen 4**: `predict` API 사용, **유료 플랜 전용** 명시 ("Imagen 3 is only available on paid plans")
- 기존 `gemini-2.0-flash` (텍스트 전용)는 이미지 생성 미지원

## 2. 프롬프트 테스트

> 쿼터 제한으로 실제 이미지 생성 테스트 불가

테스트 예정 프롬프트 (유료 전환 후 재검증 필요):
```
"A navy puffer jacket, flat lay photography on pure white background,
magazine cutout style, no mannequin, isolated garment,
high quality product photo, clean edges"
```

## 3. 실용성 평가

| 항목 | 결과 |
|------|------|
| API 지원 여부 | ✅ 모델 존재 (gemini-2.5-flash-image, Imagen 4) |
| 무료 플랜 지원 | ❌ 이미지 생성은 유료 전용 |
| 생성 속도 | 미측정 (쿼터 부족) |
| 이미지 품질 | 미측정 |
| 스타일 일관성 | 미측정 |
| 예상 비용 | Gemini API Pay-as-you-go 요금 적용 필요 |
| Supabase Storage 저장 | ✅ 기술적으로 가능 (base64 → Buffer → upload) |

### 추가 검증: `gemini-2.5-flash` (텍스트 전용 모델)

- `gemini-2.5-flash`는 텍스트 생성은 무료 사용 가능 (200 OK 확인)
- 그러나 `responseModalities: ['TEXT', 'IMAGE']` 설정 시 **"This model only supports text output"** 에러 (400)
- 즉, `gemini-2.5-flash` ≠ `gemini-2.5-flash-image` — 별도 모델

## 4. 결론

```
- API 지원 여부: ✅ (모델 존재, API 구조 확인)
- 무료 플랜: ❌ (이미지 생성 쿼터 = 0, 텍스트 전용 모델은 이미지 미지원)
- 모델명: gemini-2.5-flash-image (이미지 생성) / gemini-2.5-flash (텍스트 전용)
- 생성 속도: 미측정 (유료 전환 필요)
- 이미지 품질: 미측정
- 스타일 일관성: 미측정
- 예상 비용: 유료 플랜 전환 후 확인 필요
- 결론: ❌ 현재 무료 플랜으로는 불가. 이미지 없이 진행.
```

## 5. 결정: 이미지 없이 진행 (옵션 B 채택)

- F4(자연어 옷 등록)는 이미지 없이 텍스트+이모지로 충분히 동작 (이미 구현 완료)
- F5(AI 코디 이미지)는 이미지 생성 대신 CSS 일러스트/이모지 조합으로 대체
- 향후 Google AI 유료 전환 시 `gemini-2.5-flash-image`로 이미지 기능 추가 가능
