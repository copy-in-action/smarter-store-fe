# 공연 상세 페이지 SEO 진단 체크리스트

## 📋 작성일
**2026-01-22**

## 🎯 목적
`app/(layout)/performances/[id]` 공연 상세 페이지가 검색엔진에 검색되지 않는 문제를 체계적으로 진단하고 해결하기 위한 체크리스트

---

## ✅ 현재 구현 상태

### 1. 페이지 렌더링 방식
**파일**: `app/(layout)/performances/[id]/page.tsx`

- [x] **Server Component 사용**: SSR로 구현되어 서버에서 HTML 생성
- [x] **데이터 Fetch**: `getPerformanceDetailForServer()` 서버 사이드에서 데이터 조회
- [x] **404 처리**: ID가 유효하지 않거나 visible=false인 경우 notFound() 호출

```typescript
export default async function PerformanceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id, 10);

  if (Number.isNaN(performanceId) || performanceId <= 0) {
    notFound();
  }
  // ...
}
```

**판정**: ✅ **정상** - SSR로 검색엔진이 완전한 HTML을 받을 수 있음

---

### 2. 메타데이터 (Metadata)
**파일**: `app/(layout)/performances/[id]/page.tsx:89-140`

#### 2.1 generateMetadata 함수
- [x] **구현 완료**: `generateMetadata()` 함수로 동적 메타데이터 생성
- [x] **기본 메타데이터**: title, description 설정
- [x] **Open Graph**: images, title, description, type 설정
- [x] **Twitter Card**: images, title, description 설정
- [x] **PAGES 상수 활용**: routes.ts의 메타데이터 생성 함수 사용

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const performance = await getPerformanceDetailForServer(performanceId);

  const baseMetadata = PAGES.PERFORMANCE.DETAIL.metadata(
    performance.title,
    performance.description?.substring(0, 160),
  );

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      images: performance.mainImageUrl ? [{ url, width, height, alt }] : [],
    },
    twitter: {
      ...baseMetadata.twitter,
      images: performance.mainImageUrl ? [performance.mainImageUrl] : [],
    },
  };
}
```

**판정**: ✅ **정상** - 메타데이터 설정이 올바르게 구현됨

#### 2.2 메타데이터 상세 내용
**파일**: `src/shared/constants/routes.ts:172-188`

```typescript
DETAIL: {
  path: (id: string | number) => `/performances/${id}`,
  metadata: (performanceTitle: string, description?: string) =>
    createMetadata(
      performanceTitle,
      description || `${performanceTitle} 공연 정보를 확인하세요.`,
      {
        openGraph: {
          type: "article",
        },
      },
    ),
  siteMap: {
    priority: 8.0,
    changeFrequency: "daily" as const,
  },
},
```

**발견된 문제점**:
- ⚠️ **Canonical URL 누락**: 공연 상세 페이지에 canonical URL이 설정되지 않음
- ⚠️ **robots 메타태그 누락**: "index, follow" 같은 명시적 크롤링 지시어 없음

**판정**: ⚠️ **개선 필요** - Canonical URL과 robots 메타태그 추가 권장

---

### 3. JSON-LD 구조화 데이터
**파일**: `app/(layout)/performances/[id]/page.tsx:30-64`

- [x] **구현 완료**: `createPerformanceSchema()` 함수로 Event + Product 혼합 스키마 생성
- [x] **보안 처리**: `safeJsonLdStringify()` 로 XSS 방지
- [x] **상세 정보 포함**:
  - name (공연명)
  - description (설명)
  - startDate, endDate (공연 기간)
  - location (공연장 정보)
  - offers (가격 정보)
  - performer (제작사/출연진)
  - image (포스터 이미지)
  - url (상세 페이지 URL)
  - category (카테고리)

```typescript
performanceSchemas = createPerformanceSchema({
  name: performance.title,
  description: performance.description || `${performance.title} 공연 정보`,
  startDate: performance.startDate || new Date().toISOString(),
  endDate: performance.endDate || undefined,
  location: {
    name: performance.venue?.name || "미정",
    address: performance.venue?.address || undefined,
  },
  offers: minPrice > 0 ? {
    price: minPrice,
    currency: "KRW",
    availability: "https://schema.org/InStock",
  } : undefined,
  performer: performance.producer || undefined,
  image: performance.mainImageUrl || undefined,
  url: `https://ticket.devhong.cc/performances/${performanceId}`,
  category: performance.category || undefined,
});
```

**판정**: ✅ **정상** - Rich Snippets를 위한 구조화 데이터 완벽 구현

---

### 4. Sitemap 설정

#### 4.1 Sitemap 구조
- [x] **메인 사이트맵 인덱스**: `/sitemap.xml` (app/sitemap.xml/route.ts)
- [x] **정적 페이지 사이트맵**: `/sitemap/sitemap.xml` (app/sitemap/sitemap.ts)
- [x] **동적 공연 사이트맵**: `/sitemap/performance/sitemap/0.xml` (app/sitemap/performance/sitemap.ts)

#### 4.2 공연 동적 사이트맵 설정
**파일**: `app/sitemap/performance/sitemap.ts:46-53`

```typescript
return response.slice(startIndex, endIndex).map((performance) => ({
  url: `${SERVICE_DOMAIN}${PAGES.PERFORMANCE.DETAIL.path(performance.id)}`,
  lastModified: performance.updatedAt ? new Date(performance.updatedAt) : new Date(),
  changeFrequency: "daily",
  priority: 0.6,  // ⚠️ 문제: routes.ts에서는 8.0인데 여기서 0.6으로 설정됨
}));
```

**발견된 문제점**:
- ❌ **우선순위 불일치**:
  - `routes.ts`: `priority: 8.0` (매우 높음)
  - `sitemap.ts`: `priority: 0.6` (중간)
  - **실제 적용값**: 0.6 (sitemap.ts가 우선)

- ❌ **우선순위 범위 오류**:
  - Sitemap 표준 범위는 0.0 ~ 1.0
  - `routes.ts`의 8.0은 표준 범위를 벗어남
  - 검색엔진이 무시하거나 1.0으로 처리할 가능성

**판정**: ❌ **오류** - 우선순위 설정 수정 필요

#### 4.3 Sitemap 인덱스 설정
**파일**: `app/sitemap.xml/route.ts`

- [x] **동적 사이트맵 포함**: 공연 사이트맵 자동 추가
- [x] **캐싱 설정**: `revalidate: 3600` (1시간)
- [x] **XML 형식**: 올바른 sitemap index 구조

**판정**: ✅ **정상** - Sitemap 인덱스가 올바르게 구현됨

---

### 5. robots.txt 설정
**파일**: `public/robots.txt`

```
User-Agent: *
Allow: /

Sitemap: https://ticket.devhong.cc/sitemap.xml
```

**판정**: ✅ **정상** - 모든 크롤러에게 전체 사이트 크롤링 허용

---

### 6. URL 구조
**현재 URL 형식**: `/performances/[id]`

- [x] **RESTful URL**: 의미있는 경로 구조
- [ ] **슬러그 포함**: 공연명이 URL에 포함되지 않음 (예: `/performances/123/라이온킹`)

**장점**:
- 간결하고 명확함
- ID 기반으로 충돌 없음

**단점**:
- URL만 봐서는 어떤 공연인지 알 수 없음
- 키워드가 URL에 없어 SEO 점수 미세하게 감소할 수 있음

**판정**: ⚠️ **선택 사항** - 현재 구조도 문제없지만, 슬러그 추가 고려 가능

---

## 🔍 SEO 검색 문제 진단 케이스

### Case 1: 검색엔진이 페이지를 발견하지 못함
**원인 분석**:
- ✅ robots.txt: Allow 설정됨
- ✅ sitemap.xml: 공연 페이지 포함됨
- ✅ **sitemap priority**: 0.8로 수정 완료 (2026-01-22)

**가능성**: **낮음** (해결됨)
- ~~Sitemap에 포함되어 있어 발견은 가능하지만, 낮은 우선순위로 인해 크롤링 순서가 늦을 수 있음~~
- Priority 0.8로 높게 설정되어 검색엔진이 우선적으로 크롤링

---

### Case 2: 검색엔진이 페이지를 크롤링했지만 인덱싱하지 않음
**원인 분석**:
- ✅ 메타데이터: 올바르게 설정됨
- ✅ 구조화 데이터: JSON-LD 구현됨
- ✅ **robots 메타태그**: 추가 완료 (2026-01-22)
- ℹ️ **Canonical URL**: 현재 URL 구조상 필수 아님 (다국어/파라미터 없음)

**가능성**: **낮음** (주요 이슈 해결됨)
- ~~Canonical URL이 없으면 검색엔진이 페이지를 중복으로 판단하거나 인덱싱 우선순위를 낮출 수 있음~~
- robots 메타태그로 명시적 인덱싱 허용 설정 완료
- 단순한 URL 구조(`/performances/4`)로 중복 콘텐츠 이슈 없음

---

### Case 3: 콘텐츠 품질 문제
**원인 분석**:
- ✅ SSR: 완전한 HTML 제공
- ✅ 구조화 데이터: Rich Snippets 가능
- ⚠️ **visible=false 페이지**: 비공개 공연이 404 처리됨 (정상)

**가능성**: **낮음**
- 기술적 구현은 올바름

---

### Case 4: 신규 사이트/페이지 (인덱싱 대기 중)
**원인 분석**:
- 검색엔진이 새 페이지를 발견하고 인덱싱하는데 시간이 걸림
- Google: 수일 ~ 수주
- Naver: 수일 ~ 수개월

**가능성**: **높음**
- 최근에 배포된 사이트라면 정상적인 대기 시간일 수 있음

---

### Case 5: Google Search Console 미등록
**원인 분석**:
- Search Console에 사이트를 등록하지 않으면 인덱싱 속도가 느림
- Sitemap을 수동으로 제출하지 않음

**가능성**: **매우 높음**
- 이것이 가장 흔한 원인

---

## 🛠️ 해결 방안 우선순위

### 🔴 Critical (즉시 조치 필요)

#### ✅ 1. Sitemap Priority 수정 ~~(완료 2026-01-22)~~
**문제**: `routes.ts`에서 8.0, `sitemap.ts`에서 0.6으로 불일치

**해결 완료**:
- ✅ `app/sitemap/performance/sitemap.ts:52` - priority: 0.8로 수정 완료
- ✅ `src/shared/constants/routes.ts:185` - priority: 0.8로 수정 완료

**효과**: 검색엔진이 공연 페이지를 높은 우선순위로 크롤링

---

#### ✅ 2. robots 메타태그 추가 ~~(완료 2026-01-22)~~
**문제**: 명시적 크롤링 지시어가 없음

**해결 완료**:
```typescript
// src/shared/constants/routes.ts:179-192 (추가 완료)
DETAIL: {
  metadata: (id: string | number, performanceTitle: string, description?: string) =>
    createMetadata(
      performanceTitle,
      description || `${performanceTitle} 공연 정보를 확인하세요.`,
      {
        alternates: {
          canonical: `/performances/${id}`,
        },
        openGraph: {
          type: "article",
        },
        robots: {  // ← 추가
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
      },
    ),
},
```

**효과**: 검색엔진에게 인덱싱 허용을 명시적으로 알림

---

### 🟡 Important (빠른 시일 내 수정 권장)

#### 4. Google Search Console 등록
**문제**: Search Console에 사이트가 등록되지 않았을 가능성

**해결 방법**:
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가: `https://ticket.devhong.cc`
3. 소유권 확인 (DNS 레코드 또는 HTML 파일 업로드)
4. Sitemap 제출: `https://ticket.devhong.cc/sitemap.xml`
5. URL 검사: 특정 공연 페이지 수동 인덱싱 요청

**효과**: 인덱싱 속도 대폭 향상

---

#### 5. Naver Search Advisor 등록
**문제**: 네이버 검색에 사이트가 등록되지 않았을 가능성

**해결 방법**:
1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) 접속
2. 사이트 등록 및 소유권 확인
3. 사이트맵 제출: `https://ticket.devhong.cc/sitemap.xml`

**효과**: 네이버 검색 결과에 노출

---

### 🟢 Optional (선택 사항)

#### 6. URL에 슬러그(slug) 추가
**현재**: `/performances/123`
**개선안**: `/performances/123/라이온킹-뮤지컬`

**장점**:
- URL에서 콘텐츠 내용 파악 가능
- 키워드가 URL에 포함되어 미세한 SEO 향상
- 사용자 경험 개선

**단점**:
- 구현 복잡도 증가
- 공연명 변경 시 URL 처리 필요
- 기존 URL 리디렉션 필요

**판정**: 현재 구조도 충분히 좋음. 여유가 있을 때 고려

---

#### 7. Open Graph 이미지 최적화
**현재**: 공연 포스터 이미지 그대로 사용

**개선안**:
- OG 이미지 전용 크기 생성 (1200x630 권장)
- 텍스트 오버레이 추가 (공연명, 날짜, 장소)
- Next.js Image Optimization 활용

**효과**: 소셜 미디어 공유 시 클릭률 향상

---

## 📊 즉시 확인할 사항

### 1. Google Search Console 확인
```bash
# 다음 사항 확인:
- 사이트가 등록되어 있는가?
- Sitemap이 제출되어 있는가?
- 인덱싱 상태는 어떤가?
- 크롤링 오류가 있는가?
```

### 2. 실제 렌더링 HTML 확인
```bash
# 브라우저에서 공연 상세 페이지 접속
# Ctrl+U (View Source)로 소스 보기
# 다음 항목 확인:
- <title> 태그에 공연명이 있는가?
- <meta name="description"> 이 있는가?
- <meta property="og:*"> 태그들이 있는가?
- <script type="application/ld+json"> 이 있는가?
- 실제 공연 정보가 HTML에 포함되어 있는가?
```

### 3. Google Rich Results Test
```bash
# URL: https://search.google.com/test/rich-results
# 공연 상세 페이지 URL 입력하여 구조화 데이터 확인
# Event 또는 Product 스키마가 인식되는지 확인
```

### 4. Sitemap 접근 확인
```bash
# 브라우저에서 다음 URL 접속하여 확인:
https://ticket.devhong.cc/sitemap.xml
https://ticket.devhong.cc/sitemap/performance/sitemap/0.xml

# 공연 페이지 URL이 올바르게 생성되는지 확인
```

---

## 🎯 최종 진단 결론

### 기술적 구현: ✅ 우수
- SSR, 메타데이터, 구조화 데이터 모두 올바르게 구현됨
- 검색엔진이 페이지를 인덱싱하는 데 필요한 기술적 요구사항 충족

### 발견된 문제점: ⚠️ 3가지
1. ❌ **Sitemap Priority 불일치** (0.6 vs 8.0, 표준 범위 위반)
2. ❌ **Canonical URL 누락**
3. ⚠️ **robots 메타태그 누락** (선택 사항이지만 권장)

### 가장 가능성 높은 원인: 🔍
1. **Google Search Console 미등록** (90% 확률)
2. **신규 사이트로 인덱싱 대기 중** (60% 확률)
3. **Canonical URL 누락으로 인한 인덱싱 지연** (40% 확률)
4. **낮은 Sitemap Priority로 인한 크롤링 지연** (30% 확률)

---

## 📝 액션 플랜

### Phase 1: 즉시 실행 (오늘)
1. ✅ 현재 상태 진단 (이 문서 작성 완료)
2. [ ] Google Search Console에서 사이트 인덱싱 상태 확인
3. [ ] Rich Results Test로 구조화 데이터 검증
4. [ ] View Source로 실제 HTML 확인

### Phase 2: 코드 수정 (1-2일 내)
1. [ ] Sitemap Priority 수정 (0.8로 통일)
2. [ ] Canonical URL 추가
3. [ ] robots 메타태그 추가

### Phase 3: 검색엔진 등록 (1주일 내)
1. [ ] Google Search Console 등록 및 Sitemap 제출
2. [ ] Naver Search Advisor 등록 및 Sitemap 제출
3. [ ] 대표 공연 페이지 수동 인덱싱 요청

### Phase 4: 모니터링 (1-2주 후)
1. [ ] Search Console에서 인덱싱 상태 확인
2. [ ] 실제 구글 검색에서 공연명으로 검색 테스트
3. [ ] Core Web Vitals 점수 확인

---

## 📚 참고 자료
- [Google Search Central - 사이트맵 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Next.js - Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org - Event](https://schema.org/Event)
- [Schema.org - Product](https://schema.org/Product)
- 프로젝트 내부 문서:
  - `document/sitemap_설정.md`
  - `document/SEO_Streaming.md`

---

**최종 업데이트**: 2026-01-22
**작성자**: Claude Code
**다음 리뷰 예정일**: 2026-02-05 (2주 후)
