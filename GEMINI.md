# Gemini 개발 가이드 (AI 에이전트용)

## 1. 🚀 핵심 원칙

- **엄격한 규칙 준수**: 본 가이드의 모든 규칙을 **반드시** 준수해야 합니다.
- **컨벤션 우선**: 새로운 코드를 작성하기 전, 반드시 주변 코드와 설정을 분석하여 기존 컨벤션을 따릅니다.
- **서버 컴포넌트 우선**: 상호작용이나 브라우저 API가 필요한 경우에만 `'use client'`를 사용합니다.
- **pnpm 단독 사용**: `npm`, `yarn`은 절대 사용하지 않습니다.

---

## 2. 🛠️ 기술 스택 및 주요 라이브러리

| 구분 | 기술 | 역할 및 사용법 |
| --- | --- | --- |
| **Package Manager** | `pnpm` | 프로젝트의 유일한 패키지 매니저. |
| **Framework** | Next.js (v16+) | App Router 기반. `app/` 디렉토리에서 라우팅 관리. |
| **UI Components** | Shadcn UI | `shared/ui`에 컴포넌트 설치. `@/shared/ui` 경로로 import. |
| **Styling** | Tailwind CSS | 유틸리티 기반 스타일링. `clsx`, `tailwind-merge`와 함께 사용. |
| **State (Server)**| React Query (v5) | 서버 상태 관리, 캐싱, 동기화. |
| **State (Client)** | Zustand | 가벼운 클라이언트 상태 관리. |
| **Forms** | React Hook Form | 폼 상태 및 유효성 검사 관리. |
| **Schema** | Zod | `React Hook Form`과 연동하여 스키마 정의 및 데이터 유효성 검사. |
| **API Client**| Orval | OpenAPI Spec을 기반으로 API 클라이언트 및 타입 자동 생성. |
| **API Mocking** | MSW | 개발 환경에서 API 모킹. `public/mockServiceWorker.js` |
| **Code Quality** | Biome | 코드 포맷팅 및 린트. (`pnpm format`, `pnpm lint`) |

---

## 3. 📂 아키텍처: Feature-Sliced Design (FSD)

### 레이어 의존성 규칙
- **단방향 의존성**: 상위 레이어는 하위 레이어만 참조할 수 있습니다.
```
app → views → widgets → features → entities → shared
```

### Public API (index.ts)
- **캡슐화**: 각 슬라이스(`entities`, `features` 등)의 내보내기는 반드시 해당 슬라이스 루트의 `index.ts` 파일을 통해 이루어져야 합니다.
- **절대 금지**: 슬라이스 내부의 특정 파일(`ui`, `api`, `model` 등)로 직접 접근하는 import 구문은 절대 사용해서는 안 됩니다.

```typescript
// ✅ 올바른 import (Public API 사용)
import { ProductCard, getProducts } from '@/entities/product';

// ❌ 잘못된 import (내부 파일 직접 접근)
import { ProductCard } from '@/entities/product/ui/ProductCard';
```

---

## 4. ✍️ 코드 작성 가이드

### 라우팅 및 메타데이터
- **`PAGES` 상수 필수**: 모든 경로와 메타데이터는 `src/shared/constants/routes.ts`의 `PAGES` 객체를 통해 관리합니다.

```typescript
// src/shared/constants/routes.ts
import { PAGES } from '@/shared/constants/routes';

// 링크 생성
<Link href={PAGES.PRODUCT.DETAIL.path(productId)} />

// 정적 메타데이터
export const metadata = PAGES.AUTH.LOGIN.metadata;

// 동적 메타데이터
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return PAGES.PRODUCT.DETAIL.metadata(product.name);
}
```

### Zod 스키마 설계
- **역할 분리**:
    - `entities`: API 명세와 1:1로 매칭되는 순수한 데이터 스키마 (요청용만 생성).
    - `features`: `entities` 스키마를 `extend`하여 폼에 특화된 변환(`transform`), 상세 검증(`refine`) 로직을 추가.
- **응답 스키마 금지**: API 응답 데이터는 Orval이 생성한 타입을 그대로 사용합니다.
- **타입 분리**: 폼 제출 데이터와 실제 API 요청 데이터를 구분하기 위해 `z.input`, `z.output`을 사용합니다.

```typescript
// src/features/performance-form/model/performance-form.schema.ts
import { createPerformanceSchema } from "@/entities/performance";

// entities 스키마 상속 및 폼 특화 로직 추가
export const createPerformanceFormSchema = createPerformanceSchema.extend({
  // 문자열로 받은 숫자 ID를 숫자로 변환
  venueId: z.string().transform(val => parseInt(val, 10)).optional(),
}).refine(
  // 시작일과 종료일 관계 검증
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: "종료일은 시작일보다 늦어야 합니다", path: ["endDate"] }
);

// Input: 폼에서 다루는 타입 (e.g. venueId: string)
export type CreatePerformanceFormInput = z.input<typeof createPerformanceFormSchema>;
// Output: API로 전송될 타입 (e.g. venueId: number)
export type CreatePerformanceFormData = z.output<typeof createPerformanceFormSchema>;
```

### 주석 규칙
1.  **함수 주석 (JSDoc)**: 목적, `@param`, `@returns`을 포함하여 **필수**로 작성합니다.
2.  **인터페이스/타입 프로퍼티**: `/** 설명 */` 형식으로 **필수**로 작성합니다.
3.  **복잡한 분기문**: 5줄 이상 또는 로직 이해가 어려운 경우, 해당 로직에 대한 설명을 주석으로 추가합니다.

### 파일 네이밍
- **Component**: `PascalCase.tsx`
- **API Call**: `camelCase.api.ts`
- **Schema**: `camelCase.schema.ts`
- **Type**: `camelCase.types.ts`

---

## 5. ✅ 개발 체크리스트

- [ ] `pnpm-lock.yaml` 외 다른 lock 파일은 없는가?
- [ ] 모든 경로는 `PAGES` 상수를 사용하는가?
- [ ] FSD Public API 원칙을 위반한 import는 없는가?
- [ ] 서버 컴포넌트로 구현 가능한데 `'use client'`를 사용하지 않았는가?
- [ ] 함수 및 인터페이스에 JSDoc 주석을 작성했는가?
- [ ] Shadcn UI 컴포넌트는 `@/shared/ui` 경로로 import 했는가?
- [ ] `pnpm lint` 실행 시 에러가 없는가?
