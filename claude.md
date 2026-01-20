# Claude 개발 가이드 (AI 참조용)

## 🚀 필수 준수 사항

### 코드 작성
- ✅ **함수 JSDoc 주석**: 목적, @param, @returns 필수
- ✅ **인터페이스 프로퍼티 주석**: `/** 설명 */` 필수
- ✅ **5줄 이상 분기문**: 분기 로직 설명 주석 필수

### FSD 아키텍처
- ✅ **레이어 의존성**: 상위 레이어만 하위 레이어 import 가능
- ✅ **Public API**: index.ts를 통한 export만 허용 (내부 경로 접근 금지)
- ✅ **Segment 네이밍**: 목적 중심 이름 사용 (components/hooks/types 지양)
- ✅ **Export 최소화**: 타입, API, 메인 컴포넌트만 노출

### Next.js & React
- ✅ **Server Component 우선**: 상호작용 필요시만 `'use client'`
- ✅ **하이드레이션 방지**: 서버/클라이언트 컴포넌트 혼용 시 배럴 파일 분리

### 도구 & 라이브러리
- ✅ **pnpm 사용**: npm, yarn 사용 금지
- ✅ **Shadcn UI**: shared/ui에 설치, `@/shared/ui`로 import
- ✅ **PAGES 상수**: `@/shared/config` 사용
- ✅ **API 파일**: xxx.api.ts (API 함수), xxx.queries.ts (React Query)

## FSD 레이어 의존성
```
app → views → widgets → features → entities → shared
     (하위 레이어만 import 가능)
```

## FSD Segment 네이밍 원칙
> **핵심**: 폴더 이름은 "무엇을 담고 있는지"가 아닌 "무엇을 위해 존재하는지(목적)"를 표현

### ❌ 피해야 할 이름 (기술적 분류)
- `components/` - 컴포넌트가 들어있다는 것만 알 수 있음
- `hooks/` - 훅이 들어있다는 것만 알 수 있음
- `types/` - 타입이 들어있다는 것만 알 수 있음
- `utils/` - 유틸리티가 들어있다는 것만 알 수 있음

### ✅ 권장하는 이름 (목적 중심)
- `ui/` - UI 컴포넌트 (FSD 공식 segment)
- `api/` - API 통신 (FSD 공식 segment)
- `model/` - 비즈니스 로직, 스키마, 타입 (FSD 공식 segment)
- `lib/` - 해당 슬라이스 전용 유틸리티 (FSD 공식 segment)
- `config/` - 설정 및 상수 (FSD 공식 segment)

### Shared 레이어 특수 케이스
```typescript
shared/
├── ui/               # UI 컴포넌트 (shadcn 포함)
│   ├── button.tsx    # shadcn 컴포넌트 (배럴 파일 없음)
│   ├── input.tsx
│   ├── Logo/         # 커스텀 컴포넌트 (폴더 단위)
│   │   ├── Logo.tsx
│   │   └── index.ts  # 배럴 파일
│   └── BackButton/
│       ├── BackButton.tsx
│       └── index.ts
├── api/              # 공통 API 설정 (axios, fetch wrapper)
├── lib/              # 공통 유틸리티 함수
├── config/           # 라우팅, 환경 변수 등 설정
└── [목적명]/         # 특정 목적의 기능 (예: device-detection, auth-events)
    ├── ui/           # UI 컴포넌트
    ├── lib/          # 유틸리티
    ├── model/        # 타입
    └── index.ts      # Public API
```

## 라우팅 & 메타데이터
```typescript
// PAGES 상수 사용 필수 (src/shared/config/routes.ts)
import { PAGES } from '@/shared/config';

// ✅ 링크 생성
<Link href={PAGES.AUTH.LOGIN.path}>로그인</Link>
<Link href={PAGES.PRODUCT.DETAIL.path(productId)}>상품 상세</Link>

// ✅ 메타데이터 설정
export const metadata = PAGES.AUTH.LOGIN.metadata;

// ✅ 동적 메타데이터
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return PAGES.PRODUCT.DETAIL.metadata(product.name, product.description);
}

// ✅ Server Component (기본)
export default async function ProductPage({ params }: Props) {
  const {id} = await params
  const product = await fetchProduct(id);
  return <ProductDetail product={product} />;
}
```
## FSD 스키마 설정 (Zod)

### entities: 기본 스키마

```typescript
// src/entities/performance/model/performance.schema.ts
// orval 타입 기반 요청 스키마만 생성 (응답 스키마 X)
export const createPerformanceSchema = z.object({
  title: z.string().min(1, "공연명을 입력해주세요").max(255),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  visible: z.boolean().default(true),
  venueId: z.number().positive().optional(),
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  endDate: z.string().min(1, "종료일을 입력해주세요"),
  // orval의 모든 필드 포함
});

export const updatePerformanceSchema = z.object({
  // 수정용 스키마 - 모든 필드 정의
});

export type CreatePerformanceForm = z.infer<typeof createPerformanceSchema>;
export type UpdatePerformanceForm = z.infer<typeof updatePerformanceSchema>;
```

### features: entities 상속 + 폼 로직
```typescript
// src/features/performance-form/model/performance-form.schema.ts
import { createPerformanceSchema } from "@/entities/performance/model/performance.schema";

// 폼 특화: 문자열→숫자 변환, 날짜 검증 등
export const createPerformanceFormSchema = createPerformanceSchema.extend({
  runningTime: z.string().optional().transform(val => parseInt(val, 10)),
  venueId: z.string().transform(val => parseInt(val, 10)).optional(),
  companyId: z.string().optional().transform(val => parseInt(val, 10)),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: "종료일은 시작일보다 늦어야 합니다", path: ["endDate"] }
);

// 타입 분리: input(폼) vs output(서버)
export type CreatePerformanceFormInput = z.input<typeof createPerformanceFormSchema>;
export type CreatePerformanceFormData = z.output<typeof createPerformanceFormSchema>;

// 호환성 유지
export const performanceFormSchema = createPerformanceFormSchema;
export type PerformanceFormInput = CreatePerformanceFormInput;
export type PerformanceFormData = CreatePerformanceFormData;
```

### 스키마 설계 원칙
- ❌ **응답 스키마 생성 금지**: orval 자동 생성 타입 사용
- ✅ **요청 스키마만**: 생성/수정용만 
- ✅ **FSD 의존성**: features가 entities 상속
- ✅ **폼 로직 분리**: entities(순수) vs features(폼 특화)
- ✅ **변환 로직**: `.transform()` 사용 (문자열 → 숫자)
- ✅ **검증 로직**: `.refine()` 사용 (복합 검증)

## Shadcn UI 사용법
```typescript
// 설치
pnpm dlx shadcn@latest add button card input

// 사용
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
```

## 폴더 구조 & Import 규칙

### 슬라이스 내부 구조
```typescript
feature-name/
├── ui/              # UI 컴포넌트
├── api/             # API 메서드 및 쿼리 hooks
│   ├── xxx.api.ts   # API 함수 (fetch, axios 등)
│   └── xxx.queries.ts  # React Query hooks (useQuery, useMutation)
├── model/           # 타입, 스키마, 비즈니스 로직
├── lib/             # 유틸리티
└── index.ts         # Public API
```

### Public API Export 전략 (index.ts)
> **원칙**: 외부에서 필요한 것만 노출 (타입, API, 메인 컴포넌트)

```typescript
// src/features/product-form/index.ts

// ✅ 메인 컴포넌트만 export (내부 하위 컴포넌트는 노출 X)
export { ProductForm } from './ui/ProductForm';

// ✅ API 및 쿼리 hooks
export { createProduct, updateProduct } from './api/product.api';
export { useCreateProductMutation } from './api/product.queries';

// ✅ 타입 및 스키마 (외부에서 사용할 것만)
export type { ProductFormInput, ProductFormData } from './model/product-form.schema';
export { productFormSchema } from './model/product-form.schema';

// ❌ 내부 구현 세부사항은 노출하지 않음
// - 하위 UI 컴포넌트 (ProductFormField, ProductFormActions 등)
// - lib 유틸리티 함수
// - 내부에서만 사용하는 타입
```

### Import 규칙
```typescript
// ✅ 올바른 import (Public API 사용)
import { ProductCard, useProductsQuery } from '@/entities/product';
import { ProductForm } from '@/features/product-form';

// ❌ 직접 접근 금지 (내부 구조 의존)
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useProductsQuery } from '@/entities/product/api/product.queries';
```

### Shared/UI 특수 규칙
```typescript
// shadcn 컴포넌트: 배럴 파일 없이 직접 import
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// 커스텀 컴포넌트: 폴더 단위로 배럴 파일 사용
import { Logo } from '@/shared/ui/Logo';
import { BackButton } from '@/shared/ui/BackButton';
```

### 서버/클라이언트 컴포넌트 분리 전략
> **문제**: index.ts에서 서버/클라이언트 컴포넌트를 혼용하면 하이드레이션 에러 발생

```typescript
// ❌ 문제가 되는 구조
// src/shared/ui/index.ts
export { ServerComponent } from './ServerComponent';  // 서버 컴포넌트
export { ClientComponent } from './ClientComponent';  // 'use client'

// 해결 방법 1: shadcn처럼 각 컴포넌트별 개별 import
import { ServerComponent } from '@/shared/ui/ServerComponent';
import { ClientComponent } from '@/shared/ui/ClientComponent';

// 해결 방법 2: 폴더로 분리하여 각각 배럴 파일 생성
// src/shared/ui/ServerComponent/index.ts
export { ServerComponent } from './ServerComponent';

// src/shared/ui/ClientComponent/index.ts
export { ClientComponent } from './ClientComponent';

import { ServerComponent } from '@/shared/ui/ServerComponent';
import { ClientComponent } from '@/shared/ui/ClientComponent';
```

## 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- API: `camelCase.api.ts`
- 쿼리: `camelCase.queries.ts` (React Query/TanStack Query hooks)
- 스키마: `camelCase.schema.ts`
- 타입: `camelCase.types.ts`

## 주석 규칙

### 인터페이스 주석 (필수)
```typescript
/**
 * 상품 정보 인터페이스
 */
interface Product {
  /** 상품 고유 ID */
  id: string;
  /** 상품명 */
  name: string;
  /** 가격 (원) */
  price: number;
}
```

### 함수 주석 (필수)
```typescript
/**
 * 상품 목록을 조회합니다
 * @param page - 페이지 번호
 * @param limit - 페이지당 항목 수
 * @returns 상품 목록과 총 개수
 */
async function fetchProducts(page: number, limit: number) {
  // 구현
}
```

### 분기문 주석 (5줄 이상 필수)
```typescript
/**
 * 사용자 권한에 따라 접근 가능한 메뉴를 필터링합니다
 * - 관리자: 모든 메뉴 접근
 * - 판매자: 상품 관리, 주문 관리
 * - 일반 사용자: 마이페이지만
 */
if (user.role === 'admin') {
  return allMenus;
} else if (user.role === 'seller') {
  return sellerMenus;
} else {
  return userMenus;
}
```

## 개발 체크리스트

### 코드 품질
- [ ] 함수 JSDoc 주석 작성 (목적, @param, @returns)
- [ ] 인터페이스 프로퍼티 주석 작성
- [ ] 5줄 이상 분기문에 설명 주석 추가

### FSD 아키텍처
- [ ] 레이어 의존성 준수 (상위 → 하위만 import)
- [ ] Segment 이름을 목적 중심으로 작성 (components/hooks/types 지양)
- [ ] Public API (index.ts)를 통한 export만 허용
- [ ] index.ts에 필요한 것만 노출 (타입, API, 메인 컴포넌트)
- [ ] 내부 구현 세부사항 노출 금지

### Next.js & React
- [ ] Server Component 우선 적용 ('use client' 최소화)
- [ ] 서버/클라이언트 컴포넌트 혼용 시 배럴 파일 분리
- [ ] PAGES 상수 사용 (@/shared/config)
- [ ] Shadcn UI 컴포넌트 활용 (@/shared/ui)

### API & 데이터
- [ ] API 함수는 xxx.api.ts에 작성
- [ ] React Query hooks는 xxx.queries.ts에 작성
- [ ] Zod 스키마는 entities에서 정의, features에서 상속
- [ ] pnpm 사용 (npm, yarn 금지)