# Claude 개발 가이드 (AI 참조용)

## 🚀 필수 준수 사항
- ✅ **함수 JSDoc 주석**: 목적, @param, @returns 필수
- ✅ **인터페이스 프로퍼티 주석**: `/** 설명 */` 필수
- ✅ **5줄 이상 분기문**: 분기 로직 설명 주석 필수
- ✅ **Server Component 우선**: 상호작용 필요시만 `'use client'`
- ✅ **FSD Public API**: index.ts를 통한 export만 허용
- ✅ **pnpm 사용**: npm, yarn 사용 금지
- ✅ **Shadcn UI**: shared/ui에 설치, `@/shared/ui`로 import

## FSD 레이어 의존성
```
app → views → widgets → features → entities → shared
     (하위 레이어만 import 가능)
```

## 라우팅 & 메타데이터
```typescript
// PAGES 상수 사용 필수 (src/shared/constants/routes.ts)
import { PAGES } from '@/shared/constants/routes';

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
```typescript
// 슬라이스 내부 구조
feature-name/
├── ui/              # UI 컴포넌트
├── api/             # API 메서드
├── model/           # 타입, 스키마
├── lib/             # 유틸리티
└── index.ts         # Public API

// Public API만 export
// src/entities/product/index.ts
export { ProductCard } from './ui/ProductCard';
export { getProducts } from './api/product.api';
export type { Product } from './model/types';

// ✅ 올바른 import
import { ProductCard, getProducts } from '@/entities/product';

// ❌ 직접 접근 금지
import { ProductCard } from '@/entities/product/ui/ProductCard';
```

## 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- API: `camelCase.api.ts`
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
- [ ] 함수/인터페이스 JSDoc 주석 작성
- [ ] Server Component 우선 적용 ('use client' 최소화)
- [ ] FSD Public API export (index.ts)
- [ ] PAGES 상수 사용 (routes.ts)
- [ ] Shadcn UI 컴포넌트 활용