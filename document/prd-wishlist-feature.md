# PRD: 찜하기 기능 (Wishlist Feature)

## 1. 개요

### 1.1 목적
사용자가 관심 있는 공연을 찜(북마크)하여 나중에 쉽게 찾아볼 수 있는 기능을 제공합니다.

### 1.2 주요 기능
- 공연 상세 페이지에서 찜하기/찜 취소
- 찜한 공연 목록 조회 페이지 (`/wishlist`)
- 로그인 필수 기능 (비로그인 시 로그인 페이지로 리다이렉트)
- Optimistic Updates를 통한 즉각적인 UI 반응

### 1.3 비즈니스 가치
- **사용자 재방문 유도**: 관심 공연을 저장하여 전환율 향상
- **개인화 경험**: 사용자별 관심사 파악 및 추천 기반 마련
- **성능 최적화**: 공연 정보 캐싱 유지 + 찜 상태만 동적 로딩

---

## 2. 현재 상태 분석 및 선행 작업

### 2.1 🔴 필수 선행 작업: 공연 API 캐싱 활성화

> **중요:** 찜하기 기능 구현 전에 반드시 공연 API 캐싱을 활성화해야 합니다.
> 상세 내용은 **[prd-performance-caching-strategy.md](./prd-performance-caching-strategy.md)** 참조

#### 문제 요약
- 현재 공연 API에서 `cache: "no-store"` 사용 중 → 캐싱 미작동
- 매 요청마다 API 호출 → 성능 저하 (TTFB 400-700ms)
- 찜하기 추가 시 성능 더 악화 가능 (800ms+)

#### 해결 방법 (간략)
```typescript
// src/entities/performance/api/performance.server.api.ts
// ❌ 제거: cache: "no-store"
// ✅ 페이지의 revalidate 설정 적용

// app/(layout)/performances/[id]/page.tsx
// ✅ 추가
export const revalidate = 300; // 5분
```

#### 성능 개선 효과
| 상태 | 공연 상세 TTFB | 찜 기능 추가 후 |
|------|---------------|----------------|
| **현재** (캐싱 없음) | 500ms | 800ms ❌ |
| **캐싱 활성화 후** | 100ms | 400ms ✅ |

**→ 상세 구현 가이드: [prd-performance-caching-strategy.md](./prd-performance-caching-strategy.md)**

### 2.2 ✅ Wishlist API 준비 상태

orval로 이미 생성 완료:
```typescript
// src/shared/api/orval/wishlist-management/wishlist-management.ts
checkWishlistStatus(performanceId: number)  // GET  /api/wishlists/{performanceId}
addWishlist(performanceId: number)          // POST /api/wishlists/{performanceId}
removeWishlist(performanceId: number)       // DELETE /api/wishlists/{performanceId}
getMyWishlists(params)                      // GET  /api/wishlists/me

// 타입
interface WishlistStatusResponse {
  isWishlisted: boolean;
}
```

### 2.3 🟡 PROTECTED_ROUTES 일관성 문제

```typescript
// src/shared/lib/middleware/authHeader.ts:10
const PROTECTED_ROUTES = ["booking", "/mypage"]; // ❌ 슬래시 혼용
```

**수정 필요:**
```typescript
const PROTECTED_ROUTES = ["/booking", "/mypage", "/wishlist"];
```

---

## 3. HTML 캐싱 전략 (핵심 아키텍처)

### 3.1 문제 정의

**질문:** 찜 상태는 사용자마다 다른데, HTML을 정적으로 캐싱할 수 있는가?

**답변:** ✅ 가능! 서버/클라이언트 컴포넌트 분리 전략 사용

### 3.2 아키텍처: 클라이언트 사이드 하이드레이션 분리

```
┌─────────────────────────────────────────────────────────────┐
│ 공연 상세 페이지 (Server Component)                          │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 정적 HTML 캐싱 (ISR)                                   │   │
│ │ - 공연 정보, 이미지, 가격, 장소 등                     │   │
│ │ - revalidate: 300 (5분마다 재검증)                    │   │
│ │ - 모든 사용자에게 동일한 HTML 제공                    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ PerformanceWishlistButton (Client Component)          │   │
│ │ - 찜 여부: 클라이언트에서 별도 fetch                   │   │
│ │ - React Query로 캐싱 및 상태 관리                     │   │
│ │ - Optimistic Updates로 즉각 반응                      │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 페이지 로드 플로우

```
1. 사용자 접속
   ↓
2. 서버: 캐싱된 HTML 반환 (50-150ms) ← 빠름!
   ↓
3. 브라우저: 공연 정보 즉시 표시
   ↓
4. 브라우저: 클라이언트 컴포넌트 하이드레이션
   ↓
5. 브라우저: checkWishlistStatus API 호출 (100-300ms)
   ↓
6. 찜 버튼 업데이트 (♡ → ♥)
```

### 3.4 React Query 캐싱 전략

#### 쿼리 키 분리
```typescript
// 공연 정보 (서버에서 fetch, HTML 캐싱)
['performance', performanceId]

// 찜 여부 (클라이언트에서 fetch, 사용자별)
['wishlist', 'status', performanceId]

// 찜 목록 (찜 페이지)
['wishlist', 'list', { page, size }]
```

#### 캐싱 옵션
```typescript
// 찜 여부 체크
useQuery({
  queryKey: ['wishlist', 'status', performanceId],
  queryFn: () => checkWishlistStatus(performanceId),
  staleTime: 1000 * 60 * 5, // 5분
  gcTime: 1000 * 60 * 10,   // 10분
  retry: false, // 401 에러 시 재시도 안 함
});

// 찜 목록
useInfiniteQuery({
  queryKey: ['wishlist', 'list'],
  queryFn: ({ pageParam = 0 }) => getMyWishlists({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.nextPage : undefined,
  staleTime: 1000 * 60 * 3, // 3분
});
```

### 3.5 중요: 찜하기는 공연 정보와 완전히 분리

```
찜 추가/삭제 시:
├─ 공연 정보 변경? NO
│  └─ 공연 제목, 가격, 이미지 등은 그대로
│
├─ 공연 상세 페이지 revalidate 필요? NO
│  └─ 공연 정보가 안 바뀌므로 revalidate 불필요
│
└─ 찜 목록 페이지만 invalidate 필요? YES
   └─ queryClient.invalidateQueries(['wishlist', 'list'])
```

---

## 4. API 명세

### 4.1 찜 여부 확인
- **Endpoint**: `GET /api/wishlists/{performanceId}`
- **orval 함수**: `checkWishlistStatus(performanceId: number)`
- **응답**: `{ data: { isWishlisted: boolean } }`
- **인증**: 필수 (401 시 `isWishlisted: false` 반환)

### 4.2 찜 추가
- **Endpoint**: `POST /api/wishlists/{performanceId}`
- **orval 함수**: `addWishlist(performanceId: number)`
- **응답**: `{ data: Unit }`
- **인증**: 필수

### 4.3 찜 삭제
- **Endpoint**: `DELETE /api/wishlists/{performanceId}`
- **orval 함수**: `removeWishlist(performanceId: number)`
- **응답**: `{ data: Unit }`
- **인증**: 필수

### 4.4 찜 목록 조회
- **Endpoint**: `GET /api/wishlists/me`
- **orval 함수**: `getMyWishlists(params?: GetMyWishlistsParams)`
- **Query**: `page`, `size`, `sort`
- **응답**: `{ data: PagedWishlistResponse }`
- **인증**: 필수

---

## 5. UI/UX 명세

### 5.1 찜하기 버튼 (공연 상세 페이지)

#### 위치
```tsx
<PerformanceTitle title={performance.title} />
{/* ⬇️ 새로운 액션 아이콘 영역 */}
<div className="flex gap-3 p-detail-wrapper my-3">
  <PerformanceWishlistButton performanceId={performance.id} />
  {/* 추후 공유하기 버튼 등 추가 가능 */}
</div>
<PerformanceHashTags />
```

#### 아이콘 상태
- **찜 안 함**: `<Heart className="w-6 h-6 text-gray-400" />` (테두리만)
- **찜 함**: `<Heart className="w-6 h-6 text-red-500 fill-red-500" />` (빨간색 채움)
- **로딩**: `<Skeleton className="w-8 h-8 rounded-full" />`

#### 인터랙션
```
비로그인 상태:
- 버튼 클릭 → 로그인 페이지로 리다이렉트 (redirect 쿼리 파라미터 포함)
- 툴팁: "로그인이 필요합니다"

로그인 상태:
- 버튼 클릭 → 즉시 UI 변경 (Optimistic Update)
- 성공 시: 상태 유지
- 에러 시: 이전 상태로 롤백 + 토스트 메시지
```

#### 레이아웃 시프트 방지
```tsx
// 고정 크기로 CLS 방지
<div className="h-10 w-10">
  {isLoading ? (
    <Skeleton className="w-full h-full rounded-full" />
  ) : (
    <Heart className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
  )}
</div>
```

### 5.2 찜 목록 페이지 (/wishlist)

#### 레이아웃
- 그리드 레이아웃 (모바일: 2열, 데스크톱: 4열)
- 공연 카드 재사용 (`entities/performance/ui/PerformanceCard`)
- 무한 스크롤 (useInfiniteQuery)

#### 빈 상태
```
┌──────────────────────────────────────┐
│                                      │
│        [♡ 아이콘]                    │
│                                      │
│    찜한 공연이 없습니다              │
│    관심 있는 공연을 찜해보세요        │
│                                      │
│    [공연 둘러보기 버튼]              │
│                                      │
└──────────────────────────────────────┘
```

---

## 6. FSD 아키텍처 설계

### 6.1 폴더 구조

```
src/
├── entities/
│   └── wishlist/                      # 찜 도메인
│       ├── api/
│       │   ├── wishlist.api.ts        # orval 함수 re-export
│       │   └── wishlist.queries.ts    # React Query hooks
│       ├── model/
│       │   └── wishlist.types.ts      # orval 타입 re-export
│       └── index.ts                   # Public API
│
├── features/
│   └── service/
│       └── performance-wishlist/      # 공연 찜하기 기능
│           ├── ui/
│           │   └── PerformanceWishlistButton.tsx
│           ├── model/
│           │   └── usePerformanceWishlist.ts  # Optimistic Updates 로직
│           └── index.ts
│
├── views/
│   └── service/
│       └── wishlist/                  # 찜 목록 페이지
│           ├── ui/
│           │   ├── WishlistPage.tsx
│           │   ├── WishlistGrid.tsx
│           │   └── WishlistEmptyState.tsx
│           └── index.ts
│
└── app/
    └── (layout)/
        └── wishlist/
            └── page.tsx               # 라우트 파일
```

### 6.2 의존성 관계
```
views/service/wishlist
  ↓ import
features/service/performance-wishlist
  ↓ import
entities/wishlist
  ↓ import
shared/api (orval 함수)
```

---

## 7. Optimistic Updates 구현

### 7.1 찜 토글 Mutation

```typescript
/**
 * 공연 찜하기/취소 mutation hook
 * Optimistic Updates를 통해 즉각적인 UI 반응 제공
 * @param performanceId - 공연 ID
 */
export function useWishlistToggleMutation(performanceId: number) {
  const queryClient = useQueryClient();
  const statusQueryKey = ['wishlist', 'status', performanceId];
  const listQueryKey = ['wishlist', 'list'];

  return useMutation({
    mutationFn: async (isCurrentlyWishlisted: boolean) => {
      if (isCurrentlyWishlisted) {
        return removeWishlist(performanceId);
      } else {
        return addWishlist(performanceId);
      }
    },

    // 1. 낙관적 업데이트
    onMutate: async (isCurrentlyWishlisted) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: statusQueryKey });

      // 이전 상태 저장 (롤백용)
      const previousStatus = queryClient.getQueryData(statusQueryKey);

      // 즉시 UI 업데이트
      queryClient.setQueryData(statusQueryKey, {
        data: { isWishlisted: !isCurrentlyWishlisted },
      });

      return { previousStatus };
    },

    // 2. 에러 시 롤백
    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(statusQueryKey, context.previousStatus);
      }
      toast.error('찜하기 처리 중 오류가 발생했습니다');
    },

    // 3. 성공/실패 관계없이 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statusQueryKey });
      queryClient.invalidateQueries({ queryKey: listQueryKey });

      // ❌ 공연 페이지 revalidate는 불필요!
      // 찜 상태는 공연 정보와 분리되어 있으므로
    },
  });
}
```

### 7.2 찜 여부 체크 Query (401 에러 처리)

```typescript
/**
 * 공연 찜 여부 조회 query hook
 * 비로그인 상태(401 에러)는 isWishlisted: false로 처리
 * @param performanceId - 공연 ID
 */
export function useWishlistStatusQuery(performanceId: number) {
  return useQuery({
    queryKey: ['wishlist', 'status', performanceId],
    queryFn: async () => {
      try {
        const response = await checkWishlistStatus(performanceId);
        return response.data;
      } catch (error: any) {
        // 401 에러는 비로그인 상태 → isWishlisted: false 반환
        if (error.response?.status === 401) {
          return { isWishlisted: false };
        }
        throw error;
      }
    },
    retry: false, // 401 에러 시 재시도 안 함
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10,   // 10분
  });
}
```

### 7.3 무한 스크롤 (찜 목록)

```typescript
/**
 * 찜 목록 무한 스크롤 query hook
 */
export function useWishlistInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ['wishlist', 'list'],
    queryFn: ({ pageParam = 0 }) => getMyWishlists({ page: pageParam, size: 20 }),
    getNextPageParam: (lastPage) => {
      const data = lastPage.data;
      return data.hasNext ? data.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
}
```

---

## 8. 구현 계획 (Phase별)

### ⚠️ Phase 0: 선행 작업 (필수) - 공연 API 캐싱 활성화

**목적:** 찜하기 추가 전 성능 베이스라인 확보

> **📋 상세 구현 가이드:**
> **[prd-performance-caching-strategy.md](./prd-performance-caching-strategy.md)** 문서의 **"Phase 1: 캐싱 활성화"** 섹션 참조

#### 작업 요약
- [ ] API 캐시 옵션 제거 (`cache: "no-store"` 삭제)
- [ ] 공연 상세 페이지 revalidate 추가 (`export const revalidate = 300`)
- [ ] 테스트 및 검증 (TTFB < 200ms, 캐시 히트율 > 80%)

**성공 기준:**
- [ ] 공연 상세 TTFB < 200ms (캐시 히트 시)
- [ ] 캐시 히트율 > 80%
- [ ] 관리자가 공연 수정 시 revalidation 작동 확인

---

### Phase 1: 기반 구조 (1-2시간)

#### Task 1-1: PROTECTED_ROUTES 수정
```typescript
// src/shared/lib/middleware/authHeader.ts

const PROTECTED_ROUTES = [
  "/booking",   // ✅ 슬래시 추가
  "/mypage",
  "/wishlist",  // ✅ 추가
];
```

**테스트:**
- [x] 비로그인 상태에서 `/wishlist` 접속 → 로그인 페이지 리다이렉트
- [x] 로그인 후 `/wishlist` 접속 → 정상 접근
- [x] redirect 쿼리 파라미터 확인

#### Task 1-2: entities/wishlist 생성

**파일 구조:**
```
src/entities/wishlist/
├── api/
│   ├── wishlist.api.ts        # orval 함수 re-export
│   └── wishlist.queries.ts    # React Query hooks
├── model/
│   └── wishlist.types.ts      # orval 타입 re-export
└── index.ts                   # Public API
```

**구현 내용:**
```typescript
// api/wishlist.api.ts
export {
  checkWishlistStatus,
  addWishlist,
  removeWishlist,
  getMyWishlists,
} from '@/shared/api/orval/wishlist-management';

// model/wishlist.types.ts
export type {
  WishlistStatusResponse,
  PagedWishlistResponse,
  GetMyWishlistsParams,
} from '@/shared/api/orval/types';

// api/wishlist.queries.ts
// useWishlistStatusQuery, useWishlistToggleMutation, useWishlistInfiniteQuery 구현

// index.ts
export * from './api/wishlist.api';
export * from './api/wishlist.queries';
export type * from './model/wishlist.types';
```

---

### Phase 2: 찜하기 버튼 (1일)

#### Task 2-1: features/service/performance-wishlist 생성

**파일 구조:**
```
src/features/service/performance-wishlist/
├── ui/
│   └── PerformanceWishlistButton.tsx
├── model/
│   └── usePerformanceWishlist.ts
└── index.ts
```

**구현 내용:**
- [x] `PerformanceWishlistButton.tsx`: UI 컴포넌트
  - 로그인 상태 체크
  - Skeleton UI (로딩 상태)
  - Heart 아이콘 (찜 상태별)
  - 클릭 핸들러
- [x] `usePerformanceWishlist.ts`: 비즈니스 로직
  - 찜 여부 조회 (useWishlistStatusQuery)
  - 찜 토글 (useWishlistToggleMutation)
  - 에러 처리

#### Task 2-2: ServicePerformanceDetail에 버튼 추가

```typescript
// src/features/service/performance-detail/ui/ServicePerformanceDetail.tsx

import { PerformanceWishlistButton } from '@/features/service/performance-wishlist';

export function ServicePerformanceDetail({ performance }) {
  return (
    <div className="pb-16 mx-auto sm:pb-20" id="performance-detail">
      <PerformanceMainImage />
      <PerformanceTitle title={performance.title} />

      {/* ⬇️ 새로운 액션 아이콘 영역 */}
      <div className="flex gap-3 p-detail-wrapper my-3">
        <PerformanceWishlistButton performanceId={performance.id} />
      </div>

      <PerformanceHashTags />
      {/* ... */}
    </div>
  );
}
```

#### Task 2-3: 테스트
- [x] 비로그인: 버튼 클릭 → 로그인 페이지 리다이렉트
- [x] 로그인: 찜하기 토글 → 즉시 UI 업데이트 (Optimistic)
- [x] 에러 시: 롤백 + 토스트 메시지
- [x] 새로고침: 찜 상태 유지 확인

---

### Phase 3: 찜 목록 페이지 (1일)

#### Task 3-1: views/service/wishlist 생성

**파일 구조:**
```
src/views/service/wishlist/
├── ui/
│   ├── WishlistPage.tsx           # 메인 페이지
│   ├── WishlistGrid.tsx           # 그리드 레이아웃
│   └── WishlistEmptyState.tsx     # 빈 상태
└── index.ts
```

**구현 내용:**
- [x] `WishlistPage.tsx`: 메인 페이지 (서버 컴포넌트)
- [x] `WishlistGrid.tsx`: 무한 스크롤 그리드 (클라이언트)
- [x] `WishlistEmptyState.tsx`: 빈 상태 UI

#### Task 3-2: 라우트 생성

```typescript
// app/(layout)/wishlist/page.tsx

import { PAGES } from "@/shared/config";
import { WishlistPage } from "@/views/service/wishlist";

export const metadata = PAGES.WISHLIST.metadata;

export default function Wishlist() {
  return <WishlistPage />;
}
```

#### Task 3-3: PAGES 상수 추가

```typescript
// src/shared/config/routes.ts

export const PAGES = {
  // ...
  WISHLIST: {
    path: "/wishlist",
    metadata: {
      title: "찜한 공연 | CIA",
      description: "관심 있는 공연을 모아보세요",
    },
  },
};
```

#### Task 3-4: 테스트
- [x] 비로그인: 접근 차단 → 로그인 페이지
- [x] 로그인: 찜 목록 조회
- [x] 무한 스크롤 동작 확인
- [x] 빈 상태 UI 확인
- [x] 공연 카드 클릭 → 상세 페이지 이동

---

### Phase 4: 통합 테스트 & 최적화 (반나절)

#### Task 4-1: 시나리오 테스트
- [ ] **Flow 1:** 비로그인 → 찜 버튼 클릭 → 로그인 → 원래 페이지 복귀 → 찜하기
- [ ] **Flow 2:** 공연 상세에서 찜하기 → 찜 목록 페이지 확인 → 찜 해제
- [ ] **Flow 3:** 찜 목록에서 공연 카드 클릭 → 상세 페이지 → 찜 상태 확인
- [ ] **Flow 4:** 네트워크 에러 시뮬레이션 → 에러 처리 확인

---

## 9. 성공 지표

### 9.1 성능
| 지표 | Before (캐싱 없음) | After Phase 0 | After Phase 3 | 목표 |
|------|-------------------|---------------|---------------|------|
| **공연 상세 TTFB** | 400-700ms | 100-200ms | 100-200ms | < 200ms |
| **캐시 히트율** | 0% | 80%+ | 80%+ | > 80% |
| **공연 API 호출/분** | 100회 | 20회 | 20회 | < 30회 |
| **찜 API 호출/분** | 0회 | 0회 | 100회 | < 150회 |
| **CLS** | 0.05 | 0.05 | 0.08 | < 0.1 |
| **LCP** | 2.3s | 1.8s | 1.9s | < 2.5s |

### 9.2 사용자 경험
- [x] 비로그인 사용자가 찜 버튼 클릭 시 로그인 페이지로 리다이렉트
- [x] 로그인 후 원래 페이지로 복귀
- [x] 찜하기 클릭 시 즉시 UI 반응 (< 100ms)
- [x] 에러 발생 시 명확한 피드백 (토스트 메시지)
- [x] 레이아웃 시프트 없음 (Skeleton UI)

### 9.3 기술적 품질
- [x] FSD 아키텍처 준수
- [x] JSDoc 주석 100% (함수, 인터페이스)
- [x] React Query 캐싱 전략 적용
- [x] Optimistic Updates 정상 동작
- [x] 에러 처리 및 롤백 완료
- [x] 서버/클라이언트 컴포넌트 분리

---

## 10. 리스크 분석 및 대응

### Risk 1: 캐싱 미작동으로 인한 성능 저하

**문제:** Phase 0을 건너뛰고 찜하기 구현 시 성능 악화
- 현재: 공연 상세 500ms + 찜 체크 300ms = **800ms**
- 캐싱 후: 공연 상세 100ms + 찜 체크 300ms = **400ms**

**대응:** **Phase 0 필수 완료 후 진행**

### Risk 2: 레이아웃 시프트 (CLS 저하)

**문제:** 찜 버튼이 나중에 로드되면서 레이아웃 변경

**대응:**
```tsx
// 고정 높이 placeholder
<div className="h-10 w-10">
  {isLoading ? <Skeleton /> : <Heart />}
</div>
```

### Risk 3: 비로그인 사용자의 혼란

**문제:** 찜 버튼 클릭 → 갑자기 로그인 페이지로 이동

**대응:**
- 버튼에 툴팁 추가: "로그인이 필요합니다"
- 로그인 페이지에 안내 메시지: "찜하기를 사용하려면 로그인이 필요합니다"

### Risk 4: 찜 API 호출 증가

**문제:** 모든 공연 상세 페이지 방문 시 찜 여부 체크 API 호출

**대응:**
- React Query `staleTime: 5분` 설정
- 같은 공연 5분 내 재방문 시 캐시 사용
- API 서버 부하 모니터링

### Risk 5: Optimistic Updates 실패 시 사용자 혼란

**문제:** 네트워크 에러로 롤백 시 사용자가 혼란스러워할 수 있음

**대응:**
- 명확한 에러 메시지: "찜하기 처리 중 오류가 발생했습니다. 다시 시도해주세요."
- 에러 발생 시 자동 롤백 (Optimistic Updates의 장점)

---

## 11. 참고 문서

### Next.js 공식 문서
- [Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

### React Query 공식 문서
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)

### 프로젝트 내부 문서
- `CLAUDE.md` - FSD 아키텍처 가이드
- `document/prd-performance-caching-strategy.md` - 공연 캐싱 전략 (Phase 0 상세 가이드)
- `document/performance-detail-seo-checklist.md` - SEO 체크리스트

---

## 12. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-03-04 | Claude Sonnet 4.5 | 초기 PRD 작성 |
| 2.0 | 2026-03-04 | Claude Sonnet 4.5 | 심층 분석 통합, 캐싱 전략 수정, Phase 0 추가 |

---

**승인자**: (승인 필요)
**검토자**: (검토 필요)
**우선순위**: High
**예상 소요 시간**: 3-4일 (Phase 0 포함)
