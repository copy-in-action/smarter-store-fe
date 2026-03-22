# Import & Export 규칙

## Public API (index.ts) 원칙

외부에서 필요한 것만 노출. 내부 구현 세부사항은 노출 금지.

| ✅ Export 필수 | ❌ Export 금지 |
|---------------|----------------|
| 메인 UI 컴포넌트 | 내부 하위 컴포넌트 |
| API 함수, React Query hooks | lib 유틸리티 함수 |
| 외부 필요 타입 (Props, Form) | 내부 구현 타입 |
| 재사용 가능 스키마 | 테스트 유틸리티 |

## index.ts 예시

### Entities
```typescript
// src/entities/product/index.ts
export { ProductCard, ProductList } from './ui/ProductCard';
export { fetchProducts, fetchProduct } from './api/product.api';
export { useProductsQuery } from './api/product.queries';
export type { Product, ProductListResponse } from './model/product.types';
export { createProductSchema } from './model/product.schema';
export type { CreateProductForm } from './model/product.schema';
```

### Features
```typescript
// src/features/admin/performance-form/index.ts
export { PerformanceForm } from './ui/PerformanceForm'; // 메인 컴포넌트만
export { useCreatePerformanceMutation } from './api/performance.queries';
export type { PerformanceFormInput, PerformanceFormData } from './model/performance-form.schema';
```

### Widgets
```typescript
// src/widgets/header/index.ts
export { Header } from './ui/Header';
export type { HeaderProps } from './ui/Header';
```

## Import 규칙

```typescript
// ✅ Public API 사용
import { BookingCard } from '@/entities/booking';
import { PerformanceForm } from '@/features/admin/performance-form';
import { PerformanceListPage } from '@/views/admin/performance-list';

// ❌ 내부 경로 직접 접근 금지
import { BookingCard } from '@/entities/booking/ui/BookingCard';
import { useBookingsQuery } from '@/entities/booking/api/booking.queries';
```

## Shared/UI 특수 규칙

```typescript
// shadcn: 배럴 파일 없이 직접 import
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// 커스텀 컴포넌트: 폴더 단위 배럴 파일
import { Logo } from '@/shared/ui/Logo';
import { BackButton } from '@/shared/ui/BackButton';
```

## 서버/클라이언트 컴포넌트 분리

index.ts에서 서버/클라이언트 컴포넌트 혼용 시 하이드레이션 에러 발생.

```typescript
// ❌ 문제: 하나의 배럴 파일에서 혼용
export { ServerComponent } from './ServerComponent';
export { ClientComponent } from './ClientComponent'; // 'use client'

// ✅ 해결 1: 개별 파일 직접 import
import { ServerComponent } from '@/shared/ui/ServerComponent';
import { ClientComponent } from '@/shared/ui/ClientComponent';

// ✅ 해결 2: 폴더별 분리
// shared/ui/ClientComponent/index.ts → export { ClientComponent }
import { ClientComponent } from '@/shared/ui/ClientComponent';
```
