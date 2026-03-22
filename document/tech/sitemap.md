# Sitemap 설정 및 구조

## 개요
Next.js App Router를 사용한 동적 사이트맵 생성 시스템으로, 대량의 공연 데이터를 효율적으로 처리합니다.

## Next.js Sitemap 자동 생성 원리

**Next.js는 `sitemap.ts` 파일을 감지하면 자동으로 해당 경로에 sitemap.xml을 생성합니다:**

- `app/sitemap.ts` → `/sitemap.xml`
- `app/sitemap/sitemap.ts` → `/sitemap/sitemap.xml`
- `app/sitemap/performance/sitemap.ts` → `/sitemap/performance/sitemap.xml`

**동적 사이트맵 생성 (중요한 URL 구조 변화):**
- `generateSitemaps()` 함수가 **없는 경우**: `/sitemap/performance/sitemap.xml` (단일 파일)
- `generateSitemaps()` 함수가 **있는 경우**: `/sitemap/performance/sitemap/0.xml`, `/sitemap/performance/sitemap/1.xml` 등

⚠️ **핵심**: `generateSitemaps()` 함수가 있으면 Next.js가 자동으로 URL 중간에 `sitemap` 폴더를 추가합니다!

**URL 구조 비교:**
```
정적 사이트맵: app/sitemap.ts → /sitemap.xml
정적 사이트맵: app/some/path/sitemap.ts → /some/path/sitemap.xml

동적 사이트맵: app/some/path/sitemap.ts + generateSitemaps() → /some/path/sitemap/[id].xml
```

## 파일 구조

```
app/
├── sitemap.ts                              # 메인 사이트맵 인덱스 (/sitemap.xml)
├── sitemap/
│   ├── sitemap.ts                         # 정적 페이지 사이트맵
│   └── performance/
│       ├── sitemap.ts                     # 동적 공연 사이트맵
```

## URL 구조

### 메인 사이트맵 인덱스
- **URL**: `/sitemap.xml`
- **파일**: `app/sitemap.ts`
- **역할**: 모든 하위 사이트맵들의 인덱스 목록 제공(동적으로 만들어진 공연 사이트맵 포함)

### 정적 페이지 사이트맵
- **URL**: `/sitemap/sitemap.xml`
- **파일**: `app/sitemap/sitemap.ts`
- **역할**: 홈 등 정적 페이지 URL 목록

### 공연 동적 사이트맵
- **URL 패턴**: `/sitemap/performance/sitemap/0.xml`, `/sitemap/performance/sitemap/1.xml`, ...
- **파일**: `app/sitemap/performance/sitemap.ts`
- **역할**: 실제 공연 상세 페이지 URL들을 5만개씩 분할하여 제공

## 공연 동적 사이트맵 시스템

### 분할 처리 방식
- **최대 URL 수**: 50,000개 (Google 권장사항 준수)
- **분할 로직**: `Math.ceil(총 공연 수 / 50000)`로 필요한 사이트맵 개수 계산
- **ID 생성**: 0, 1, 2, ... 순차적으로 생성

### generateSitemaps() 함수
```typescript
export async function generateSitemaps() {
  const response = await getPerformancesForServer({
    next: { revalidate: 3600 },
    cache: "default",
  });

  if (!response) return [];

  const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

  return Array.from({ length: totalSitemaps }, (_, index) => ({
    id: index,
  }));
}
```

### 동적 사이트맵 생성
```typescript
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  
  const startIndex = id * MAX_URLS_PER_SITEMAP;
  const endIndex = Math.min(startIndex + MAX_URLS_PER_SITEMAP, response.length);
  
  return response.slice(startIndex, endIndex).map((performance) => ({
    url: `${SERVICE_DOMAIN}/performance/${performance.id}`,
    lastModified: performance.updatedAt ? new Date(performance.updatedAt) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
```

## 캐시 설정 주의사항

### ⚠️ 사이트맵에서 fetch 캐시 설정 금지

**사이트맵 생성 시 `cache: "no-store"`를 설정하면 안 되는 이유:**

1. **정적 생성 방해**: Next.js는 빌드 시 사이트맵을 정적으로 생성하려고 하는데, `cache: "no-store"`가 있으면 동적 서버 사용으로 간주하여 정적 생성이 실패합니다.

2. **빌드 오류 발생**: 
   ```
   Error: Dynamic server usage: Route couldn't be rendered statically 
   because it used no-store fetch
   ```

3. **올바른 캐시 설정**:
   ```typescript
   // ❌ 잘못된 설정 - 빌드 실패
   const response = await getPerformancesForServer({
     cache: "no-store"
   });

   // ✅ 올바른 설정 - 정적 생성 성공
   const response = await getPerformancesForServer({
     next: { revalidate: 3600 },  // 1시간마다 재검증
     cache: "default"             // 또는 생략
   });
   ```

### API 함수 캐시 처리

```typescript
// src/features/home/api/home-server.api.ts
export async function getPerformancesForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse[] }>(
    getGetAllPerformancesUrl(),  //orval에서 생성한 getUrl함수를 사용
    mergedOptions,
  );

  return response.data || [];
}
```

**주요 특징:**
- `cache: "no-store"`를 기본값으로 설정 (홈페이지 실시간 데이터용)
- `fetchOptions`로 전달된 옵션이 기본값을 덮어씀 (사이트맵용 캐시 설정 가능)
- 사이트맵에서 `cache: "default"`나 `next: { revalidate: 3600 }`을 전달하면 정적 생성 가능

## 사용 예시

### 1. 홈페이지에서 실시간 데이터 필요
```typescript
// cache: "no-store" 자동 적용 - 실시간 데이터
const performances = await getPerformancesForServer();
```

### 2. 사이트맵에서 정적 생성 필요
```typescript
// next: { revalidate: 3600 } 설정 - 정적 생성 가능
const performances = await getPerformancesForServer({
  next: { revalidate: 3600 }
});
```

## 빌드 결과 확인

성공적으로 설정된 경우 빌드 출력에서 다음과 같은 사이트맵들을 확인할 수 있습니다:

```
├ ○ /sitemap.xml
├ ○ /sitemap/sitemap.xml
├ ○ /sitemap/performance/sitemap/0.xml
├ ○ /sitemap/performance/sitemap/1.xml
└ ...
```

## SEO 최적화 효과

1. **검색엔진 크롤링 효율성**: 모든 공연 페이지가 사이트맵에 포함되어 검색엔진이 쉽게 발견할 수 있습니다.
2. **대량 데이터 처리**: 5만개씩 분할하여 검색엔진 권장사항을 준수합니다.
3. **자동 업데이트**: 새로운 공연가 추가되면 자동으로 사이트맵에 포함됩니다.