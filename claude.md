# Claude 개발 가이드 (AI 참조용)

## 🚀 QUICK REFERENCE

### 필수 준수 사항
- ✅ **모든 함수**: JSDoc 주석 필수 (목적, @param, @returns)
- ✅ **모든 인터페이스/타입**: 각 프로퍼티에 `/** 설명 */` 주석 필수
- ✅ **5줄 이상 분기문**: 분기 로직 설명 주석 필수
- ✅ **Server Component 우선**: 상호작용 필요시만 `'use client'`
- ✅ **SSR/SEO 우선**: generateMetadata, fetch 캐싱 활용
- ✅ **FSD Public API**: index.ts를 통한 export만 허용
- ✅ **pnpm 사용**: npm, yarn 사용 금지

### FSD 레이어 의존성 규칙
```
app → views → widgets → features → entities → shared
     (하위 레이어만 import 가능)
```

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- API: `camelCase.api.ts`
- 타입: `camelCase.types.ts`
- 유틸리티: `camelCase.ts`

---

## FSD 레이어 규칙

### 1. shared (공유 레이어)
- 프로젝트 전체에서 사용되는 공통 코드
- 다른 레이어에 의존하지 않음
- UI 컴포넌트, 유틸, API 클라이언트 등

### 2. entities (엔티티 레이어)
- 비즈니스 엔티티 (Product, User, Order 등)
- shared에만 의존
- UI 컴포넌트, 모델, API 메서드 포함

### 3. features (기능 레이어)
- 사용자 시나리오와 기능 (로그인, 장바구니 추가 등)
- shared, entities에 의존
- 사용자 상호작용 처리

### 4. widgets (위젯 레이어)
- 독립적인 UI 블록 (Header, Footer, ProductCard 등)
- shared, entities, features에 의존
- 여러 features를 조합 가능

### 5. views (페이지 레이어)
- 페이지 단위 컴포넌트
- 모든 하위 레이어 사용 가능
- **주의**: Next.js의 `app/` 폴더와 분리됨

### 6. app (앱 레이어)
- Next.js App Router (라우팅)
- Providers, 전역 설정
- views를 import하여 사용

---

## 개발 규칙

### TypeScript

#### 인터페이스 주석 (필수)
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
  /** 재고 수량 */
  stock: number;
  /** 상품 설명 */
  description?: string;
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

### 복잡한 로직 주석 예시

```typescript
/**
 * 사용자의 주문 가능 여부를 확인합니다
 *
 * 다음 조건을 모두 만족해야 주문 가능:
 * - 로그인 상태
 * - 이메일 인증 완료
 * - 배송지 정보 등록
 * - 결제 수단 등록
 *
 * @param userId - 사용자 ID
 * @returns 주문 가능 여부와 불가 사유
 */
async function checkOrderAvailability(userId: string): Promise<{
  /** 주문 가능 여부 */
  available: boolean;
  /** 불가 시 사유 */
  reason?: string;
}> {
  const user = await getUser(userId);

  // 로그인 체크
  if (!user) {
    return { available: false, reason: '로그인이 필요합니다' };
  }

  /**
   * 사용자 인증 상태 확인
   * - 이메일 미인증: 주문 불가
   * - 전화번호 미인증: 경고만 표시
   */
  if (!user.emailVerified) {
    return { available: false, reason: '이메일 인증이 필요합니다' };
  }

  // 배송지 정보 확인
  if (!user.hasAddress) {
    return { available: false, reason: '배송지를 등록해주세요' };
  }

  // 결제 수단 확인
  if (!user.hasPaymentMethod) {
    return { available: false, reason: '결제 수단을 등록해주세요' };
  }

  return { available: true };
}
```

### Next.js SSR/SEO 우선 원칙

#### 1. Server Components 우선
```typescript
// ✅ 좋은 예: Server Component (기본)
export default async function ProductPage({ params }: Props) {
  const product = await fetchProduct(params.id);
  return <ProductDetail product={product} />;
}

// ❌ 나쁜 예: 불필요한 Client Component
'use client'
export default function ProductPage() {
  const [product, setProduct] = useState(null);
  // ...
}
```

#### 2. Metadata 설정 (SEO)
```typescript
/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}
```

#### 3. 데이터 Fetching
```typescript
/**
 * 서버에서 상품 데이터를 가져옵니다 (캐싱 적용)
 */
async function fetchProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    next: { revalidate: 3600 } // 1시간 캐싱
  });
  return res.json();
}
```

#### 4. Client Component는 필요시에만
상호작용이 필요한 경우에만 `'use client'` 사용:
- useState, useEffect 등 React hooks
- 이벤트 핸들러
- 브라우저 API 사용

### API 통신

#### API 클라이언트 구조
```typescript
// src/shared/api/client.ts

/**
 * API 기본 URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API 요청을 위한 fetch 래퍼
 * @param endpoint - API 엔드포인트
 * @param options - fetch 옵션
 * @returns 응답 데이터
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
```

#### 엔티티별 API
```typescript
// src/entities/product/api/product.api.ts

/**
 * 상품 목록 응답 타입
 */
interface ProductListResponse {
  /** 상품 배열 */
  products: Product[];
  /** 전체 상품 수 */
  total: number;
}

/**
 * 상품 목록을 조회합니다
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 항목 수
 * @returns 상품 목록과 총 개수
 */
export async function getProducts(
  page: number = 1,
  limit: number = 20
): Promise<ProductListResponse> {
  return apiClient(`/products?page=${page}&limit=${limit}`);
}
```

### 컴포넌트 작성

#### Server Component
```typescript
// src/views/product/ProductListView.tsx

/**
 * 상품 목록 페이지 뷰
 * @param searchParams - URL 쿼리 파라미터
 */
export default async function ProductListView({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { products, total } = await getProducts(page);

  return (
    <div>
      <ProductList products={products} />
      <Pagination total={total} currentPage={page} />
    </div>
  );
}
```

#### Client Component
```typescript
// src/features/cart/ui/AddToCartButton.tsx
'use client';

/**
 * 장바구니 추가 버튼 속성
 */
interface AddToCartButtonProps {
  /** 상품 ID */
  productId: string;
  /** 상품명 */
  productName: string;
}

/**
 * 장바구니에 상품을 추가하는 버튼 컴포넌트
 */
export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  /**
   * 장바구니 추가 핸들러
   */
  const handleAddToCart = () => {
    // 구현
  };

  return <button onClick={handleAddToCart}>장바구니 담기</button>;
}
```

---

## 폴더 구조

### 슬라이스 내부 구조
```
feature-name/
├── ui/              # UI 컴포넌트
├── api/             # API 메서드
├── model/           # 타입, 상태, 비즈니스 로직
├── lib/             # 유틸리티
└── index.ts         # Public API
```

### Import 규칙

#### Public API만 export
```typescript
// src/entities/product/index.ts
export { ProductCard } from './ui/ProductCard';
export { getProducts, getProduct } from './api/product.api';
export type { Product } from './model/types';
```

#### 다른 레이어에서 사용
```typescript
// ✅ 좋은 예: Public API 사용
import { ProductCard, getProducts } from '@/entities/product';

// ❌ 나쁜 예: 내부 구조 직접 접근
import { ProductCard } from '@/entities/product/ui/ProductCard';
```

---

## 코딩 컨벤션

### Import 순서 (Biome가 자동 정리)
1. React 관련
2. Next.js 관련
3. 외부 라이브러리
4. FSD 레이어 순서 (shared → entities → features → widgets → views)
5. 상대 경로 import
6. CSS/스타일

### 함수 컴포넌트
```typescript
/**
 * 컴포넌트 설명
 */
export default function ComponentName() {
  return <div>...</div>;
}
```

---

## 개발 워크플로우

### 1단계: FSD 레이어 결정
```
비즈니스 엔티티 (Product, User)      → entities/
사용자 기능 (로그인, 장바구니)         → features/
독립적 UI 블록 (Header, Footer)      → widgets/
전체 페이지 (상품 목록, 상세)         → views/
```

### 2단계: 폴더 생성
```bash
src/features/my-feature/
├── ui/              # UI 컴포넌트
├── api/             # API 메서드
├── model/           # 타입, 상태, 비즈니스 로직
└── index.ts         # Public API export
```

### 3단계: 개발
1. **타입 정의**: 인터페이스 주석 필수
2. **API 구현**: 함수 주석 필수
3. **컴포넌트 작성**: Server Component 우선
4. **Public API export**: index.ts

### 4단계: 체크리스트
- [ ] 함수/인터페이스 주석 작성
- [ ] Server Component 우선 적용
- [ ] Public API export
- [ ] `pnpm lint` 통과

---

## 코드 품질 체크리스트

### 작성 전
- [ ] FSD 레이어 결정
- [ ] Server/Client Component 결정
- [ ] SSR/SEO 전략 수립

### 작성 중
- [ ] 함수 JSDoc 주석 (목적, @param, @returns)
- [ ] 인터페이스 프로퍼티 주석 (`/** 설명 */`)
- [ ] 5줄 이상 분기문 설명 주석
- [ ] TypeScript 타입 명시

### 작성 후
- [ ] `pnpm lint` 통과
- [ ] Public API export 확인 (index.ts)
- [ ] `pnpm build` 성공
- [ ] SSR 동작 확인 (generateMetadata, fetch 캐싱)
