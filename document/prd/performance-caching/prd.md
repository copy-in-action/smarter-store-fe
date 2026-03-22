# PRD: 공연 데이터 캐싱 및 무효화 전략

## 1. 개요

### 1.1 목적
SEO가 중요한 공연 리스트 및 상세 페이지의 응답 속도를 개선하기 위해 Next.js의 Data Cache와 ISR(Incremental Static Regeneration)을 활용하여 캐싱 전략을 수립하고, 관리자의 CUD(Create, Update, Delete) 작업 시 캐시를 즉시 무효화하여 데이터 일관성을 보장합니다.

### 1.2 범위
- 메인 페이지 (`/`) 캐싱 전략
- 공연 상세 페이지 (`/performances/[id]`) 캐싱 전략
- 공연 리스트 API 캐싱 전략
- CUD 작업 시 On-Demand Revalidation을 통한 캐시 무효화

> **참고:** 찜하기 기능과의 캐싱 전략은 **[prd-wishlist-feature.md](./prd-wishlist-feature.md)** 참조

### 1.3 비즈니스 가치
- **SEO 향상**: 서버에서 렌더링된 HTML을 검색엔진에 제공
- **성능 개선**: API 중복 호출 최소화 및 응답 속도 향상
- **사용자 경험 향상**: 빠른 페이지 로딩으로 이탈률 감소
- **서버 비용 절감**: 불필요한 API 호출 및 DB 쿼리 감소

---

## 2. 현재 상태 분석

### 2.1 현재 구현
```typescript
// ❌ 문제: 페이지 레벨에서 revalidate를 설정했지만
// app/(layout)/page.tsx
export const revalidate = 60;

// ❌ 문제: API에서 cache: "no-store"를 사용하여 캐시가 작동하지 않음
// src/entities/performance/api/performance.server.api.ts
const mergedOptions = {
  requireAuth: false,
  cache: "no-store" as RequestCache,  // ← 이게 우선순위가 높아서 캐시 무효화
  ...fetchOptions,
};
```

### 2.2 문제점
| 문제 | 설명 | 영향 |
|------|------|------|
| **캐시 미작동** | API에서 `cache: "no-store"` 사용 | 매 요청마다 API 호출, 성능 저하 |
| **revalidate 무의미** | 캐시가 없으므로 재검증할 데이터도 없음 | ISR 전략이 작동하지 않음 |
| **중복 API 호출** | 동일한 데이터를 여러 번 요청 | 서버 부하 증가 |
| **SEO 영향 없음** | SSR은 작동하지만 캐싱 미적용 | 크롤러 요청마다 API 호출 |

---

## 3. 요구사항

### 3.1 기능 요구사항

#### FR-1: 메인 페이지 캐싱
- **경로**: `/`
- **캐시 전략**: ISR (60초 재검증)
- **캐시 대상**:
  - 공연 리스트 API (`GET /api/performances`)
  - 홈 섹션 API (`GET /api/home/sections`)
- **재검증 조건**:
  - 시간 기반: 60초마다 백그라운드 재검증
  - 이벤트 기반: 공연 CUD 시 즉시 재검증

#### FR-2: 공연 상세 페이지 캐싱
- **경로**: `/performances/[id]`
- **캐시 전략**: ISR (300초 재검증)
- **캐시 대상**:
  - 공연 상세 API (`GET /api/performances/{id}`)
- **재검증 조건**:
  - 시간 기반: 300초(5분)마다 백그라운드 재검증
  - 이벤트 기반: 해당 공연 수정/삭제 시 즉시 재검증

#### FR-3: 공연 CUD 시 캐시 무효화
- **트리거**:
  - 공연 생성 (`POST /api/admin/performances`)
  - 공연 수정 (`PUT /api/admin/performances/{id}`)
  - 공연 삭제 (`DELETE /api/admin/performances/{id}`)
- **무효화 대상**:
  - 메인 페이지 (`/`)
  - 공연 상세 페이지 (`/performances/[id]`) - 수정/삭제 시
- **무효화 방식**: On-Demand Revalidation (revalidatePath)

#### FR-4: React Query 캐시 무효화
- **트리거**: 공연 CUD 작업 성공 시
- **무효화 대상**:
  - 공연 리스트 쿼리 (`PERFORMANCE_QUERY_KEYS.lists()`)
  - 공연 상세 쿼리 (`PERFORMANCE_QUERY_KEYS.detail(id)`)

### 3.2 비기능 요구사항

#### NFR-1: 캐시 일관성
- CUD 작업 후 5초 이내에 캐시 무효화 완료
- 무효화 실패 시 로그 기록 (사용자 경험에 영향 없음)

#### NFR-2: 보안
- Revalidation API에 secret 키 검증 필수
- Secret 키는 서버 환경 변수로 관리 (`REVALIDATE_SECRET`)

#### NFR-3: 성능
- 캐시 히트율 80% 이상 목표
- 캐시된 페이지 응답 시간 < 200ms

---

## 4. 캐싱 전략 상세

### 4.1 Next.js Data Cache 계층

```
사용자 요청
    ↓
Next.js Router
    ↓
[페이지 레벨 캐시]  ← revalidate 설정
    ↓
Server Component
    ↓
[Fetch 레벨 캐시]   ← fetch cache 옵션
    ↓
API Server
```

### 4.2 캐싱 전략 설계

| 페이지/API | 캐시 시간 | 이유 | revalidate 설정 위치 |
|-----------|----------|------|---------------------|
| 메인 페이지 (`/`) | 60초 | 자주 변경되지 않지만 신규 공연 노출 필요 | 페이지 레벨 |
| 공연 상세 (`/performances/[id]`) | 300초 (5분) | 상세 정보는 덜 자주 변경됨 | 페이지 레벨 |
| 공연 리스트 API | 60초 | 메인 페이지와 동일 | fetch 옵션 상속 |
| 공연 상세 API | 300초 | 상세 페이지와 동일 | fetch 옵션 상속 |

### 4.3 캐시 무효화 플로우

```
[관리자] 공연 수정
    ↓
Mutation 실행 (useUpdatePerformance)
    ↓
API 호출 성공
    ↓
onSuccess 콜백
    ├─ React Query 캐시 무효화 (클라이언트)
    │  ├─ queryClient.invalidateQueries(PERFORMANCE_QUERY_KEYS.lists())
    │  └─ queryClient.invalidateQueries(PERFORMANCE_QUERY_KEYS.detail(id))
    │
    └─ On-Demand Revalidation (서버)
       └─ revalidatePerformancePages()
          ├─ POST /api/revalidate { path: "/" }
          │  └─ revalidatePath("/")
          │
          └─ POST /api/revalidate { path: `/performances/${id}` } (수정/삭제 시)
             └─ revalidatePath(`/performances/${id}`)

[결과]
- 관리자: React Query 캐시 무효화로 즉시 갱신된 데이터 확인
- 일반 사용자: 다음 요청 시 revalidate된 최신 데이터 확인
```

---

## 5. 구현 상세

### 5.1 페이지 레벨 캐싱

#### 메인 페이지
```typescript
// app/(layout)/page.tsx

/**
 * ISR (Incremental Static Regeneration) 설정
 * - 60초마다 자동 재검증 (백그라운드)
 * - 관리자가 공연 추가/수정/삭제 시 On-Demand Revalidation으로 즉시 업데이트
 */
export const revalidate = 60;

export default function Home() {
  return <HomePage />;
}
```

#### 공연 상세 페이지
```typescript
// app/(layout)/performances/[id]/page.tsx

/**
 * ISR 설정 (5분)
 * - 300초마다 자동 재검증
 * - 공연 수정/삭제 시 즉시 재검증
 */
export const revalidate = 300;

export default async function PerformanceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id, 10);

  if (Number.isNaN(performanceId) || performanceId <= 0) {
    notFound();
  }

  // ...
}
```

### 5.2 API 레벨 캐싱

#### 수정 전 (❌ 문제)
```typescript
// src/entities/performance/api/performance.server.api.ts

export async function getPerformancesForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache, // ❌ 캐시 비활성화
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse[] }>(
    getGetAllPerformancesUrl(),
    mergedOptions,
  );

  return response.data || [];
}
```

#### 수정 후 (✅ 해결)
```typescript
// src/entities/performance/api/performance.server.api.ts

export async function getPerformancesForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    // ✅ cache 옵션 제거 → 페이지의 revalidate 설정이 적용됨
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse[] }>(
    getGetAllPerformancesUrl(),
    mergedOptions,
  );

  return response.data || [];
}

export async function getPerformanceDetailForServer(
  performanceId: number,
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse> {
  const mergedOptions = {
    requireAuth: false,
    // ✅ cache 옵션 제거
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse }>(
    getGetPerformanceUrl(performanceId),
    mergedOptions,
  );

  return response.data;
}
```

**대안: fetch 레벨에서 명시적으로 설정 (선택적)**
```typescript
export async function getPerformancesForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    next: { revalidate: 60 }, // ✅ fetch 레벨에서 명시적 설정
    ...fetchOptions,
  };
  // ...
}
```

### 5.3 On-Demand Revalidation API (✅ 이미 구현됨)

```typescript
// app/api/revalidate/route.ts

import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, secret } = body;

    // 보안: secret 키 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    // 경로별 재검증
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
      return NextResponse.json({
        revalidated: true,
        type: "path",
        value: path,
        now: Date.now(),
      });
    }

    return NextResponse.json(
      { message: "Missing path parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error },
      { status: 500 }
    );
  }
}
```

### 5.4 Revalidation 헬퍼 함수 개선

#### 현재 구현 (✅ 기본 동작)
```typescript
// src/shared/lib/revalidate.ts

export async function revalidatePage(path: string): Promise<boolean> {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET, // ⚠️ 보안 취약
      }),
    });

    if (!response.ok) {
      console.error(`Failed to revalidate ${path}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Revalidated: ${path}`, data);
    return true;
  } catch (error) {
    console.error(`Error revalidating ${path}:`, error);
    return false;
  }
}

export async function revalidatePerformancePages() {
  await Promise.all([
    revalidatePage("/"), // 홈페이지
    revalidatePage("/performances"), // 공연 목록 (있다면)
  ]);
}
```

#### 개선 제안 (✅ 보안 강화)
```typescript
// src/shared/lib/revalidate.ts

/**
 * 특정 경로의 캐시를 재검증합니다
 * @param path - 재검증할 경로 (예: "/", "/performances/123")
 * @returns 재검증 성공 여부
 */
export async function revalidatePage(path: string): Promise<boolean> {
  try {
    // ✅ 서버 환경 변수 사용 (클라이언트에서 호출 시 문제 가능)
    const secret = process.env.REVALIDATE_SECRET || process.env.NEXT_PUBLIC_REVALIDATE_SECRET;

    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        secret,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to revalidate ${path}:`, await response.text());
      return false;
    }

    const data = await response.json();
    console.log(`✅ Revalidated: ${path}`, data);
    return true;
  } catch (error) {
    console.error(`Error revalidating ${path}:`, error);
    return false;
  }
}

/**
 * 공연 관련 페이지들을 재검증합니다
 * @param performanceId - 수정/삭제된 공연 ID (선택적)
 */
export async function revalidatePerformancePages(performanceId?: number) {
  const paths = [
    "/", // 홈페이지
    // "/performances", // 공연 목록 페이지 (있다면)
  ];

  // 특정 공연 상세 페이지도 재검증
  if (performanceId) {
    paths.push(`/performances/${performanceId}`);
  }

  await Promise.all(paths.map(path => revalidatePage(path)));
}
```

### 5.5 Mutation 훅 개선

#### 현재 구현 (✅ 기본 동작)
```typescript
// src/entities/performance/api/performance.queries.ts

export const useUpdatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceRequest }) =>
      updateExistingPerformance(id, data),
    onSuccess: async (_, { id }) => {
      // React Query 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(id),
      });

      // 홈페이지 캐시 즉시 재생성
      await revalidatePerformancePages();
    },
  });
};
```

#### 개선 제안 (✅ 성능 ID 전달)
```typescript
// src/entities/performance/api/performance.queries.ts

export const useUpdatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceRequest }) =>
      updateExistingPerformance(id, data),
    onSuccess: async (_, { id }) => {
      // React Query 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(id),
      });

      // ✅ 홈페이지 + 해당 공연 상세 페이지 재검증
      await revalidatePerformancePages(id);
    },
  });
};

export const useDeletePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExistingPerformance,
    onSuccess: async (_, performanceId) => {
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      queryClient.removeQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
      });

      // ✅ 삭제된 공연 상세 페이지도 재검증
      await revalidatePerformancePages(performanceId);
    },
  });
};
```

## 6. 환경 변수 설정

### 6.1 필수 환경 변수

```bash
# .env.local (서버 전용)
REVALIDATE_SECRET=your-super-secret-key-here

# .env (클라이언트에서도 접근 가능, 권장하지 않음)
# NEXT_PUBLIC_REVALIDATE_SECRET=your-public-secret-key
```

### 6.2 보안 권장사항
- `REVALIDATE_SECRET`은 서버 환경 변수로만 관리 (클라이언트 노출 금지)
- 프로덕션 환경에서는 강력한 랜덤 문자열 사용
- Vercel 등 호스팅 플랫폼의 환경 변수 관리 기능 활용

---

## 7. 테스트 시나리오

### 7.1 캐싱 테스트

#### Test 1: 메인 페이지 캐싱
1. 메인 페이지 최초 접속 → 로딩 시간 측정 (T1)
2. 새로고침 (60초 이내) → 로딩 시간 측정 (T2)
3. **기대 결과**: T2 < T1 (캐시 히트)

#### Test 2: 공연 상세 캐싱
1. 공연 상세 페이지 최초 접속 → 로딩 시간 측정 (T1)
2. 새로고침 (300초 이내) → 로딩 시간 측정 (T2)
3. **기대 결과**: T2 < T1 (캐시 히트)

#### Test 3: 시간 기반 재검증
1. 메인 페이지 접속 → 캐시 생성
2. 60초 대기
3. 다시 접속 → 백그라운드 재검증 발생 확인 (로그)
4. **기대 결과**: 사용자는 캐시된 페이지 즉시 확인, 백그라운드에서 재검증

### 7.2 캐시 무효화 테스트

#### Test 4: 공연 생성 후 캐시 무효화
1. 메인 페이지 접속 → 공연 개수 확인 (N개)
2. 관리자 페이지에서 신규 공연 생성
3. 메인 페이지 새로고침 → 공연 개수 확인 (N+1개)
4. **기대 결과**: 신규 공연이 즉시 노출됨

#### Test 5: 공연 수정 후 캐시 무효화
1. 공연 상세 페이지 접속 → 제목 확인 (예: "공연 A")
2. 관리자 페이지에서 제목 수정 (예: "공연 A 수정")
3. 공연 상세 페이지 새로고침 → 제목 확인
4. **기대 결과**: 수정된 제목이 즉시 반영됨

#### Test 6: 공연 삭제 후 캐시 무효화
1. 메인 페이지에서 공연 목록 확인 (공연 ID 123 포함)
2. 관리자 페이지에서 공연 ID 123 삭제
3. 메인 페이지 새로고침 → 공연 목록 확인
4. `/performances/123` 접속
5. **기대 결과**:
   - 메인 페이지에서 공연 제거됨
   - 상세 페이지는 404 표시

### 7.3 에러 핸들링 테스트

#### Test 7: Revalidation API 실패
1. `.env`에서 `REVALIDATE_SECRET` 제거
2. 관리자 페이지에서 공연 수정
3. **기대 결과**:
   - Mutation은 성공
   - Revalidation은 실패 (콘솔 에러)
   - 사용자에게 영향 없음 (시간 기반 재검증으로 최종 일관성 보장)

#### Test 8: API 서버 다운
1. API 서버 중단
2. 메인 페이지 접속
3. **기대 결과**:
   - 캐시된 데이터 표시 (revalidate 시간 내)
   - revalidate 시간 초과 시 에러 처리

---

## 8. 성능 지표

### 8.1 측정 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| **캐시 히트율** | 80% 이상 | Next.js 로그 분석 |
| **메인 페이지 TTFB** | < 200ms | Lighthouse, WebPageTest |
| **공연 상세 TTFB** | < 300ms | Lighthouse, WebPageTest |
| **Revalidation 지연** | < 5초 | 로그 타임스탬프 분석 |
| **서버 API 호출 감소** | 60% 감소 | APM 도구 (DataDog, New Relic) |

### 8.2 모니터링 포인트

```typescript
// 캐시 히트/미스 로깅
export async function getPerformancesForServer(/* ... */) {
  const startTime = Date.now();

  const response = await serverFetch(/* ... */);

  const duration = Date.now() - startTime;
  console.log(`[Cache] GET /api/performances - ${duration}ms`);

  return response.data || [];
}
```

---

## 9. 롤아웃 계획

### Phase 1: 캐싱 활성화
- [ ] `performance.server.api.ts`에서 `cache: "no-store"` 제거
- [ ] 공연 상세 페이지에 `export const revalidate = 300` 추가
- [ ] 개발 환경 테스트

### Phase 2: Revalidation 개선
- [ ] `revalidatePerformancePages(performanceId)` 개선
- [ ] Mutation 훅에서 `performanceId` 전달
- [ ] 환경 변수 보안 강화 (`REVALIDATE_SECRET`)

### Phase 3: 모니터링 및 최적화
- [ ] 캐시 히트율 모니터링
- [ ] TTFB 측정 및 개선
- [ ] 캐시 시간 조정 (필요 시)

> **다음 단계:** 찜하기 기능 구현 시 **[prd-wishlist-feature.md](./prd-wishlist-feature.md)** 참조

---

## 10. 리스크 및 대응 방안

| 리스크 | 영향 | 대응 방안 |
|--------|------|-----------|
| **캐시된 데이터 불일치** | 사용자가 구 데이터 확인 | On-Demand Revalidation으로 즉시 무효화 |
| **Revalidation API 실패** | 캐시 무효화 지연 | 시간 기반 재검증으로 최종 일관성 보장 |
| **캐시 과다 사용** | 메모리 부족 | Next.js가 자동 관리, 필요 시 수동 설정 |

> **사용자별 데이터 (찜하기 등) 추가 시:** [prd-wishlist-feature.md](./prd-wishlist-feature.md)의 "HTML 캐싱 전략" 참조

---

## 11. 참고 자료

### Next.js 공식 문서
- [Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

### 내부 문서
- `CLAUDE.md` - 프로젝트 FSD 가이드
- `document/performance-detail-seo-checklist.md` - SEO 체크리스트
- `document/prd-wishlist-feature.md` - 찜하기 기능 PRD (캐싱 전략 포함)

---

## 12. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-03-03 | Claude Sonnet 4.5 | 초기 PRD 작성 |
| 1.1 | 2026-03-04 | Claude Sonnet 4.5 | 찜하기 기능 관련 내용 분리, prd-wishlist-feature.md 참조 추가 |

---

**승인자**: (승인 필요)
**검토자**: (검토 필요)