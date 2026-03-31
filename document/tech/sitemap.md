# Sitemap 설정 및 구조

## 개요
Next.js App Router를 사용한 동적 사이트맵 생성 시스템으로, 대량의 공연 데이터를 효율적으로 처리합니다.

## ⚠️ Next.js 15/16 중요 이슈: sitemap.ts vs route.ts

### Next.js 15/16의 중첩 sitemap.ts 버그

**문제:**
- Next.js 15/16에서 중첩된 `sitemap.ts` 구조가 **Vercel 배포 시 404 에러** 발생
- 로컬 개발 환경에서는 정상 작동하나, 프로덕션 배포 시 실패
- 관련 이슈: [Next.js #72787](https://github.com/vercel/next.js/issues/72787), [#72808](https://github.com/vercel/next.js/issues/72808)

**영향받는 구조:**
```
❌ app/sitemap/sitemap.ts → /sitemap/sitemap.xml (404 on Vercel)
❌ app/sitemap/performance/sitemap.ts + generateSitemaps() → /sitemap/performance/sitemap/[id].xml (404 on Vercel)
```

**해결 방법:**
```
✅ app/sitemap.xml/route.ts → /sitemap.xml (정상 작동)
✅ app/sitemap/sitemap.xml/route.ts → /sitemap/sitemap.xml (정상 작동)
✅ app/sitemap/performance/sitemap/[id].xml/route.ts → /sitemap/performance/sitemap/[id].xml (정상 작동)
```

### route.ts 방식 채택 이유

1. **Vercel 배포 안정성**: 프로덕션 환경에서 404 에러 방지
2. **명시적 경로 제어**: URL 구조를 파일 시스템에서 명확히 표현
3. **동적 라우팅 지원**: `[id].xml` 형태의 동적 세그먼트 사용 가능
4. **XML 직접 생성**: Response 객체로 XML을 직접 제어 가능

## 파일 구조

```
app/
├── sitemap.xml/
│   └── route.ts                          # 메인 사이트맵 인덱스 (/sitemap.xml)
└── sitemap/
    ├── sitemap.xml/
    │   └── route.ts                      # 정적 페이지 사이트맵 (/sitemap/sitemap.xml)
    └── performance/
        └── [id].xml/
            └── route.ts                  # 동적 공연 사이트맵 (/sitemap/performance/[id].xml)
```

## URL 구조

### 메인 사이트맵 인덱스
- **URL**: `/sitemap.xml`
- **파일**: `app/sitemap.xml/route.ts`
- **역할**: 모든 하위 사이트맵들의 인덱스 목록 제공(동적으로 만들어진 공연 사이트맵 포함)

### 정적 페이지 사이트맵
- **URL**: `/sitemap/sitemap.xml`
- **파일**: `app/sitemap/sitemap.xml/route.ts`
- **역할**: 홈 등 정적 페이지 URL 목록

### 공연 동적 사이트맵
- **URL 패턴**: `/sitemap/performance/0.xml`, `/sitemap/performance/1.xml`, ...
- **파일**: `app/sitemap/performance/[id].xml/route.ts`
- **역할**: 실제 공연 상세 페이지 URL들을 5만개씩 분할하여 제공

## 공연 동적 사이트맵 시스템

### 분할 처리 방식
- **최대 URL 수**: 50,000개 (Google 권장사항 준수)
- **분할 로직**: `Math.ceil(총 공연 수 / 50000)`로 필요한 사이트맵 개수 계산
- **ID 생성**: 0, 1, 2, ... 순차적으로 생성

### generateStaticParams() 함수 (route.ts)
```typescript
// app/sitemap/performance/sitemap/[id].xml/route.ts

export async function generateStaticParams() {
  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response) return [];

    const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

    return Array.from({ length: totalSitemaps }, (_, index) => ({
      id: String(index),
    }));
  } catch (error) {
    console.error("Failed to generate sitemap params:", error);
    return [];
  }
}
```

### 동적 사이트맵 XML 생성 (route.ts)
```typescript
// app/sitemap/performance/sitemap/[id].xml/route.ts

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const SERVICE_DOMAIN = "https://ticket.devhong.cc";
  const { id } = await props.params;
  const sitemapId = Number(id);

  const response = await getPerformancesForServer({
    next: { revalidate: 3600 },
    cache: "default",
  });

  if (!response) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }

  const startIndex = sitemapId * MAX_URLS_PER_SITEMAP;
  const endIndex = Math.min(startIndex + MAX_URLS_PER_SITEMAP, response.length);

  const sitemapData = response.slice(startIndex, endIndex).map((performance) => ({
    url: `${SERVICE_DOMAIN}${PAGES.PERFORMANCE.DETAIL.path(performance.id)}`,
    lastModified: performance.updatedAt
      ? new Date(performance.updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // XML 직접 생성
  const urlEntries = sitemapData.map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
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

## 빌드 및 배포 결과 확인

### 로컬 개발 환경
```bash
pnpm dev
```

테스트 URL:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/sitemap/sitemap.xml
- http://localhost:3000/sitemap/performance/sitemap/0.xml

### 프로덕션 빌드
```bash
pnpm build
```

성공적으로 설정된 경우 빌드 출력에서 다음과 같은 라우트들을 확인할 수 있습니다:

```
├ ○ /sitemap.xml
├ ○ /sitemap/sitemap.xml
├ λ /sitemap/performance/sitemap/[id].xml
└ ...
```

범례:
- `○` (Static): 정적 페이지 (빌드 시 생성)
- `λ` (Server): 서버 사이드 렌더링

### Vercel 배포 확인

배포 후 다음 URL들이 모두 정상 작동하는지 확인:

```
https://your-domain.vercel.app/sitemap.xml ✅
https://your-domain.vercel.app/sitemap/sitemap.xml ✅
https://your-domain.vercel.app/sitemap/performance/sitemap/0.xml ✅
```

**주의사항:**
- sitemap.ts 방식은 로컬에서 작동하더라도 Vercel 배포 시 404 발생 가능
- 반드시 Vercel 배포 후 실제 URL 접근 테스트 필요
- Google Search Console에 sitemap.xml 등록 시 인덱스 URL만 등록

## SEO 최적화 효과

1. **검색엔진 크롤링 효율성**: 모든 공연 페이지가 사이트맵에 포함되어 검색엔진이 쉽게 발견할 수 있습니다.
2. **대량 데이터 처리**: 5만개씩 분할하여 검색엔진 권장사항을 준수합니다.
3. **자동 업데이트**: 새로운 공연이 추가되면 자동으로 사이트맵에 포함됩니다.
4. **프로덕션 안정성**: route.ts 방식으로 Vercel 배포 시에도 안정적으로 작동합니다.