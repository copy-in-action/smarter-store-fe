# Claude 개발 가이드 (AI 참조용)

> 이 프로젝트는 **FSD(Feature-Sliced Design)** 아키텍처를 따릅니다.
> FSD는 비즈니스 기능 중심으로 코드를 구조화하는 방법론입니다.
>
> **핵심**: Layer(계층) → Service Type(서비스 종류) → Slice(도메인) → Segment(목적)으로 코드를 조직하며,
> 상위 레이어는 하위 레이어로만 의존할 수 있습니다.
>
> **프로젝트 특징**:
> - `src/views/`는 FSD의 `pages` 레이어에 해당합니다
> - `views/`와 `features/` 하위에 서비스 종류별 분류 폴더(`admin`, `service`, `booking` 등)가 있습니다
> - `entities/`는 서비스 종류별 분류 없이 순수 도메인만 관리합니다

## 🚀 필수 준수 사항

### 코드 작성
- ✅ **함수 JSDoc 주석**: 목적, @param, @returns 필수
- ✅ **인터페이스 프로퍼티 주석**: `/** 설명 */` 필수
- ✅ **5줄 이상 분기문**: 분기 로직 설명 주석 필수

### FSD 아키텍처
- ✅ **3대 원칙**: Public API, Isolation(격리), Needs Driven(비즈니스 중심)
- ✅ **레이어 의존성**: 상위 레이어만 하위 레이어 import 가능 (같은 레이어 간 직접 참조 금지)
- ✅ **Service Type 분류**: views/features 하위에 admin, service, booking 등 서비스 종류별 폴더 사용
- ✅ **Public API**: index.ts를 통한 export만 허용 (내부 경로 접근 금지)
- ✅ **Segment 네이밍**: 목적 중심 (ui/api/model/lib/config) 사용, 기술 분류(components/hooks/types) 금지
- ✅ **Export 최소화**: 메인 컴포넌트, 외부 필요 타입/API만 노출 (내부 구현 세부사항 금지)

### Next.js & React
- ✅ **Server Component 우선**: 상호작용 필요시만 `'use client'`
- ✅ **하이드레이션 방지**: 서버/클라이언트 컴포넌트 혼용 시 배럴 파일 분리

### 도구 & 라이브러리
- ✅ **pnpm 사용**: npm, yarn 사용 금지
- ✅ **Shadcn UI**: shared/ui에 설치, `@/shared/ui`로 import
- ✅ **PAGES 상수**: `@/shared/config` 사용
- ✅ **API 파일**: xxx.api.ts (API 함수), xxx.queries.ts (React Query)

## FSD 레이어 구조

### 레이어 의존성
```
app       ← 최상위 (앱 전역 설정)
  ↓
views     ← 화면/페이지 (FSD의 pages 레이어에 해당)
  ↓
widgets   ← 자체완결 UI 블록
  ↓
features  ← 사용자 기능
  ↓
entities  ← 비즈니스 개념
  ↓
shared    ← 최하위 (공통 인프라)

** 상위 레이어는 하위 레이어로만 의존 가능 **
```

### 각 레이어 역할 요약

| 레이어 | 역할 | 포함 내용 | 예시 |
|--------|------|-----------|------|
| **app** (필수) | 앱 전역 설정 | Provider, 글로벌 스타일 | QueryProvider, layout.tsx |
| **views** (필수) | 페이지/화면 | UI 렌더링, 데이터 페칭 | admin/performance-list, service/booking-detail |
| **widgets** (선택) | 재사용 UI 블록 | 헤더, 푸터, 사이드바 | header, admin-sidebar |
| **features** (선택) | 사용자 기능 | 폼, API 호출, 인터랙션 | admin/performance-form, booking/payment |
| **entities** (선택) | 비즈니스 개념 | 도메인 타입, CRUD API, 스키마 | product, booking, venue |
| **shared** (필수) | 공통 인프라 | API 클라이언트, UI 키트, 유틸 | button, routes, format |

## FSD 4단계 구조: Layer → Service Type → Slice → Segment

**이 프로젝트는 서비스 종류별 분류를 추가한 4단계 구조를 사용합니다**

```
📂 features/              # Layer: 계층 (책임도별 수평 분할)
  📂 admin/               # Service Type: 서비스 종류 (admin, service 등)
    📂 performance-form/  # Slice: 슬라이스 (도메인별 수직 분할)
      📂 ui/              # Segment: 세그먼트 (목적별 분류)
      📂 api/
      📂 model/
      📄 index.ts         # Public API
```

| 구조 | 정의 | 규칙 | 예시 |
|------|------|------|------|
| **Layer** | 책임도별 수평 분할 | 상위 → 하위만 의존 | `views`, `features`, `entities`, `shared` |
| **Service Type** | 서비스 종류별 분류 | views와 features에서만 사용 | `admin`, `service`, `booking` |
| **Slice** | 도메인별 수직 분할 | 같은 레이어 내 직접 참조 금지 | `performance-form`, `booking-detail` |
| **Segment** | 목적별 분류 | 목적 중심 네이밍 | `ui`, `api`, `model` (⭕) / `components`, `hooks` (❌) |

### 실제 프로젝트 구조 예시
```typescript
src/
├── app/                          # Layer: 앱 전역 설정
│   ├── layout.tsx                # 루트 레이아웃
│   ├── providers/                # 전역 Provider
│   └── styles/                   # 글로벌 스타일
│
├── views/                        # Layer: 페이지 (FSD의 pages에 해당)
│   ├── admin/                    # Service Type: 관리자
│   │   ├── performance-list/     # Slice: 공연 목록 페이지
│   │   │   ├── ui/               # Segment: UI
│   │   │   │   └── PerformanceListPage.tsx
│   │   │   └── index.ts
│   │   └── venue-detail/         # Slice: 공연장 상세 페이지
│   │       ├── ui/
│   │       └── index.ts
│   └── service/                  # Service Type: 서비스
│       ├── booking-detail/       # Slice: 예약 상세 페이지
│       │   ├── ui/
│       │   │   └── BookingDetailPage.tsx
│       │   └── index.ts
│       └── performance-detail/   # Slice: 공연 상세 페이지
│
├── widgets/                      # Layer: 재사용 UI 블록
│   ├── admin-sidebar/            # Slice: 관리자 사이드바
│   └── header/                   # Slice: 헤더
│
├── features/                     # Layer: 사용자 기능
│   ├── admin/                    # Service Type: 관리자
│   │   ├── performance-form/     # Slice: 공연 폼
│   │   │   ├── ui/               # Segment: UI 컴포넌트
│   │   │   │   ├── PerformanceForm.tsx    # 메인 컴포넌트 (export)
│   │   │   │   └── PerformanceFormField.tsx # 내부 컴포넌트 (export X)
│   │   │   ├── api/              # Segment: API
│   │   │   │   ├── performance.api.ts
│   │   │   │   └── performance.queries.ts
│   │   │   ├── model/            # Segment: 비즈니스 로직
│   │   │   │   └── performance-form.schema.ts
│   │   │   └── index.ts          # Public API
│   │   └── venue-form/           # Slice: 공연장 폼
│   ├── booking/                  # Service Type: 예약
│   │   └── payment/              # Slice: 예약 결제
│   │       ├── ui/
│   │       ├── api/
│   │       ├── model/
│   │       └── index.ts
│   └── service/                  # Service Type: 서비스
│       └── performance-search/   # Slice: 공연 검색
│
├── entities/                     # Layer: 비즈니스 개념
│   ├── booking/                  # Slice: 예약 도메인
│   │   ├── ui/                   # Segment: UI
│   │   │   └── BookingCard.tsx
│   │   ├── api/                  # Segment: API
│   │   │   ├── booking.api.ts
│   │   │   └── booking.queries.ts
│   │   ├── model/                # Segment: 모델
│   │   │   ├── booking.types.ts  # orval 생성 타입
│   │   │   └── booking.schema.ts # Zod 스키마
│   │   └── index.ts
│   ├── performance/              # Slice: 공연 도메인
│   └── venue/                    # Slice: 공연장 도메인
│
└── shared/                       # Layer: 공통 인프라
    ├── ui/                       # UI 컴포넌트
    │   ├── button.tsx            # shadcn (배럴 파일 없음)
    │   ├── input.tsx
    │   └── Logo/                 # 커스텀 (폴더 단위)
    │       ├── Logo.tsx
    │       └── index.ts
    ├── api/                      # API 설정
    │   └── client.ts             # axios 클라이언트
    ├── lib/                      # 공통 유틸리티
    │   └── format.ts
    ├── config/                   # 설정
    │   ├── routes.ts             # PAGES 상수
    │   └── env.ts
    └── auth-events/              # 특정 목적 (auth 이벤트)
        ├── ui/
        ├── lib/
        └── index.ts
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
## Entities vs Features 관계

```
features (폼 로직)  →  entities (도메인)  →  shared (인프라)
   ✅ import            ✅ import
   ❌ reverse           ❌ reverse

// ✅ features → entities
import { createPerformanceSchema } from '@/entities/performance';

// ❌ entities → features (불가능!)
import { performanceFormSchema } from '@/features/admin/performance-form';
```

| | Entities | Features |
|---|----------|----------|
| **역할** | 순수 도메인 (서버 API 스펙) | 폼 로직 (UI ↔ 서버 변환) |
| **스키마** | 기본 검증만 | entities 상속 + UI 변환 |
| **의존** | shared만 | entities + shared |

## FSD 스키마 설정 (Zod)

### Entities: 기본 스키마 (순수 도메인)

**목적**: 서버 API 스펙과 일치하는 순수한 데이터 검증

```typescript
// src/entities/performance/model/performance.schema.ts
import { z } from 'zod';

// ✅ orval 타입 기반 요청 스키마만 생성 (응답 스키마 X)
// ✅ 순수한 도메인 검증 (UI 로직 포함 X)
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

### Features: Entities 상속 + 폼 로직

**목적**: UI 입력 처리 및 서버 데이터로 변환

```typescript
// src/features/admin/performance-form/model/performance-form.schema.ts
import { createPerformanceSchema } from "@/entities/performance";
import { z } from 'zod';

// ✅ entities 스키마 상속
// ✅ 폼 특화: 문자열→숫자 변환, UI 검증 추가
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

// ✅ 타입 분리: input(폼에서 입력) vs output(서버로 전송)
export type CreatePerformanceFormInput = z.input<typeof createPerformanceFormSchema>;
export type CreatePerformanceFormData = z.output<typeof createPerformanceFormSchema>;

// 호환성 유지
export const performanceFormSchema = createPerformanceFormSchema;
export type PerformanceFormInput = CreatePerformanceFormInput;
export type PerformanceFormData = CreatePerformanceFormData;
```

### 스키마 설계 원칙
- ❌ **응답 스키마 생성 금지**: orval 자동 생성 타입 사용
- ✅ **요청 스키마만**: 생성/수정용만 Zod로 정의
- ✅ **FSD 의존성 준수**: features가 entities 상속 (역방향 금지)
- ✅ **레이어 분리**:
  - **Entities**: 순수 도메인 검증 (서버 API 스펙)
  - **Features**: 폼 특화 로직 (UI ↔ 서버 변환)
- ✅ **변환 로직**: `.transform()` 사용 (문자열 → 숫자)
- ✅ **검증 로직**: `.refine()` 사용 (복합 검증)
- ✅ **타입 구분**: `z.input<T>` (입력) vs `z.output<T>` (출력)

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
# views와 features 레이어 (서비스 타입 포함)
service-type/        # admin, service, booking 등
└── feature-name/
    ├── ui/              # UI 컴포넌트
    ├── api/             # API 메서드 및 쿼리 hooks
    │   ├── xxx.api.ts   # API 함수 (fetch, axios 등)
    │   └── xxx.queries.ts  # React Query hooks (useQuery, useMutation)
    ├── model/           # 타입, 스키마, 비즈니스 로직
    ├── lib/             # 유틸리티
    └── index.ts         # Public API

# entities 레이어 (서비스 타입 없음)
feature-name/
├── ui/
├── api/
├── model/
├── lib/
└── index.ts
```

### Public API Export 전략 (index.ts)
> **원칙**: 외부에서 필요한 것만 노출 (타입, API, 메인 컴포넌트)

#### Entities Layer 예시
```typescript
// src/entities/product/index.ts

// ✅ UI 컴포넌트
export { ProductCard } from './ui/ProductCard';
export { ProductList } from './ui/ProductList';

// ✅ API 함수 및 React Query hooks
export { fetchProducts, fetchProduct, createProduct } from './api/product.api';
export { useProductsQuery, useProductQuery } from './api/product.queries';

// ✅ 타입 (orval 생성 타입)
export type { Product, ProductListResponse } from './model/product.types';

// ✅ 스키마 (요청용)
export { createProductSchema, updateProductSchema } from './model/product.schema';
export type { CreateProductForm, UpdateProductForm } from './model/product.schema';

// ❌ 내부 구현 세부사항은 노출 X
// - ProductCardImage, ProductCardPrice 등 내부 컴포넌트
// - lib 유틸리티 함수
```

#### Features Layer 예시
```typescript
// src/features/admin/performance-form/index.ts

// ✅ 메인 컴포넌트만 export (내부 하위 컴포넌트는 노출 X)
export { PerformanceForm } from './ui/PerformanceForm';

// ✅ API 및 쿼리 hooks (feature 레벨 로직)
export { useCreatePerformanceMutation, useUpdatePerformanceMutation } from './api/performance.queries';

// ✅ 타입 및 스키마 (외부에서 사용할 것만)
export type { PerformanceFormInput, PerformanceFormData } from './model/performance-form.schema';
export { performanceFormSchema } from './model/performance-form.schema';

// ❌ 내부 구현 세부사항은 노출하지 않음
// - 하위 UI 컴포넌트 (PerformanceFormField, PerformanceFormActions 등)
// - lib 유틸리티 함수
// - 내부에서만 사용하는 타입
```

#### Widgets Layer 예시
```typescript
// src/widgets/header/index.ts

// ✅ 위젯 메인 컴포넌트
export { Header } from './ui/Header';

// ✅ 외부에서 필요한 타입만
export type { HeaderProps } from './ui/Header';

// ❌ 내부 컴포넌트는 노출 X
// - HeaderLogo, HeaderNav, HeaderActions 등
```

#### Export 기준

| ✅ Export 필수 | ❌ Export 금지 |
|---------------|----------------|
| 메인 UI 컴포넌트 | 내부 하위 컴포넌트 |
| API 함수, React Query hooks | lib 유틸리티 함수 |
| 외부 필요 타입 (Props, Form) | 내부 구현 타입 |
| 재사용 가능 스키마 | 테스트 유틸리티 |

### Import 규칙
```typescript
// ✅ 올바른 import (Public API 사용)
// entities (서비스 타입 없음)
import { BookingCard, useBookingsQuery } from '@/entities/booking';
import { PerformanceCard } from '@/entities/performance';

// features (서비스 타입 포함)
import { PerformanceForm } from '@/features/admin/performance-form';
import { BookingPayment } from '@/features/booking/payment';
import { PerformanceSearch } from '@/features/service/performance-search';

// views (서비스 타입 포함)
import { PerformanceListPage } from '@/views/admin/performance-list';
import { BookingDetailPage } from '@/views/service/booking-detail';

// ❌ 직접 접근 금지 (내부 구조 의존)
import { BookingCard } from '@/entities/booking/ui/BookingCard';
import { PerformanceForm } from '@/features/admin/performance-form/ui/PerformanceForm';
import { useBookingsQuery } from '@/entities/booking/api/booking.queries';
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
- [ ] **FSD 3대 원칙 준수**:
  - [ ] Public API: index.ts를 통한 export만 허용
  - [ ] Isolation: 상위/동일 레이어 의존 금지
  - [ ] Needs Driven: 비즈니스 중심 구조화
- [ ] **레이어 의존성**: 상위 레이어만 하위 레이어 import 가능
  - [ ] views → features (⭕)
  - [ ] features → entities (⭕)
  - [ ] entities → features (❌)
  - [ ] features → features (❌ - 같은 레이어 간 직접 참조 금지)
- [ ] **Service Type 분류**: views와 features 레이어에만 적용
  - [ ] admin/, service/, booking/ 등으로 분류
  - [ ] entities는 서비스 타입 분류 없이 순수 도메인만 관리
- [ ] **Segment 네이밍**: 목적 중심 이름 사용
  - [ ] ui/, api/, model/, lib/, config/ 사용
  - [ ] components/, hooks/, types/, utils/ 금지
- [ ] **Public API Export 최소화**:
  - [ ] 메인 컴포넌트만 export (내부 컴포넌트 X)
  - [ ] 외부에서 필요한 타입/API만 노출
  - [ ] lib 유틸리티 함수 노출 금지
- [ ] **Slice 독립성**: 같은 레이어 내 슬라이스 간 직접 참조 금지

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