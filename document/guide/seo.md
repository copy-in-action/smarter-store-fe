# SEO 개발 가이드

> 검색 엔진 최적화(SEO)를 위한 개발 가이드입니다.
> 새로운 페이지 개발 시 이 가이드를 참조하여 SEO를 고려한 구현을 하세요.

---

## 목차

1. [메타데이터 설정](#1-메타데이터-설정)
2. [구조화된 데이터 (JSON-LD)](#2-구조화된-데이터-json-ld)
3. [사이트맵 관리](#3-사이트맵-관리)
4. [헤딩 구조](#4-헤딩-구조)
5. [이미지 최적화](#5-이미지-최적화)
6. [URL 구조](#6-url-구조)
7. [체크리스트](#7-체크리스트)

---

## 1. 메타데이터 설정

### 1.1 정적 페이지 메타데이터

**위치**: `@/shared/config/routes.ts`의 `SERVICE_PAGES` 객체에서 중앙 관리

```typescript
export const SERVICE_PAGES = {
  HOME: {
    path: "/",
    title: "YEME",
    description: "뮤지컬, 콘서트, 연극, 클래식 공연 예매",
    keywords: "공연 예매, 뮤지컬, 콘서트, 연극",
    priority: 1.0,
    changeFrequency: "daily",
    canonical: "/",
    sitemap: {
      include: true,
    },
    openGraph: {
      title: "YEME",
      description: "...",
      images: ["/images/meta/open-graph.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "YEME",
      description: "...",
      images: ["/images/meta/open-graph.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  },
};
```

### 1.2 동적 페이지 메타데이터

**위치**: 각 페이지의 `generateMetadata()` 함수

```typescript
/**
 * 공연 상세 페이지 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PerformanceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const performance = await getPerformanceDetail(id);

  return {
    title: `${performance.name} | YEME`,
    description: performance.description?.slice(0, 160),
    openGraph: {
      title: performance.name,
      description: performance.description,
      images: [
        {
          url: performance.posterUrl || "/images/meta/open-graph.png",
          width: 1200,
          height: 630,
          alt: performance.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: performance.name,
      description: performance.description,
      images: [performance.posterUrl || "/images/meta/open-graph.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
```

### 1.3 필수 메타데이터 항목

| 항목 | 필수 여부 | 설명 |
|------|-----------|------|
| `title` | ✅ 필수 | 페이지 제목 (60자 이내 권장) |
| `description` | ✅ 필수 | 페이지 설명 (160자 이내 권장) |
| `openGraph.title` | ✅ 필수 | OG 제목 |
| `openGraph.description` | ✅ 필수 | OG 설명 |
| `openGraph.images` | ✅ 필수 | OG 이미지 (1200x630 권장) |
| `openGraph.type` | 권장 | 콘텐츠 타입 (website/article) |
| `twitter.card` | 권장 | Twitter 카드 타입 |
| `robots` | 권장 | 크롤러 제어 |
| `keywords` | 선택 | 검색 키워드 (구글은 무시하지만 다른 검색엔진에서 사용) |
| `alternates.canonical` | 중복 시 필수 | 정규 URL |

---

## 2. 구조화된 데이터 (JSON-LD)

### 2.1 JSON-LD 유틸리티 사용

**위치**: `@/shared/lib/json-ld.ts`

모든 JSON-LD는 XSS 방지를 위해 `safeJsonLdStringify()` 함수를 사용해야 합니다.

```typescript
import {
  createWebsiteSchema,
  createOrganizationSchema,
  createPerformanceSchema,
} from "@/shared/lib/json-ld";

// 페이지 컴포넌트 내부
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: createPerformanceSchema(performance, siteUrl),
  }}
/>
```

### 2.2 제공되는 스키마 함수

#### 2.2.1 WebSite 스키마

```typescript
/**
 * WebSite 스키마 생성 (홈페이지용)
 * - 사이트 정보
 * - 검색 기능 (잠재적 액션)
 */
createWebsiteSchema(siteUrl: string): string
```

#### 2.2.2 Organization 스키마

```typescript
/**
 * Organization 스키마 생성
 * - 조직 정보
 * - 로고
 */
createOrganizationSchema(siteUrl: string): string
```

#### 2.2.3 Performance 스키마 (Event + Product)

```typescript
/**
 * 공연 스키마 생성
 * - Event 스키마 (공연 정보)
 * - Product 스키마 (티켓 상품, 선택적)
 * - 카테고리별 자동 타입 결정
 */
createPerformanceSchema(
  performance: Performance,
  siteUrl: string
): string
```

**카테고리별 Event 타입**:
- 뮤지컬/연극 → `TheaterEvent`
- 콘서트/클래식 → `MusicEvent`
- 기타 → `Event`

### 2.3 구조화된 데이터 테스트

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

---

## 3. 사이트맵 관리

### 3.1 사이트맵 구조

```
/sitemap.xml (인덱스)
├── /sitemap/sitemap.xml (정적 페이지)
└── /sitemap/performance/[id].xml (동적 공연 페이지, 50,000개 단위)
```

### 3.2 새 정적 페이지 추가 시

`@/shared/config/routes.ts`의 `SERVICE_PAGES`에 추가하고 `sitemap.include: true` 설정:

```typescript
NEW_PAGE: {
  path: "/new-page",
  title: "...",
  description: "...",
  priority: 0.7,
  changeFrequency: "weekly",
  sitemap: {
    include: true, // 사이트맵에 포함
  },
}
```

### 3.3 새 동적 페이지 추가 시

1. `app/sitemap/[category]/sitemap.ts` 생성
2. 최대 50,000개 단위로 분할
3. 캐시 설정 (revalidate: 3600 권장)
4. `app/sitemap.xml/route.ts`의 인덱스에 추가

**참고**: [document/tech/sitemap.md](../tech/sitemap.md)

---

## 4. 헤딩 구조

### 4.1 헤딩 계층 규칙

```html
<!-- ✅ 올바른 구조 -->
<h1>페이지 제목</h1>
<h2>섹션 제목</h2>
<h3>하위 섹션</h3>
<h3>또 다른 하위 섹션</h3>
<h2>다른 섹션</h2>

<!-- ❌ 잘못된 구조 -->
<h1>페이지 제목</h1>
<h3>섹션 제목</h3> <!-- h2 건너뜀 -->
```

### 4.2 필수 규칙

- ✅ **h1은 페이지당 1개만** 사용
- ✅ **헤딩은 순차적으로** (h1 → h2 → h3, 건너뛰기 금지)
- ✅ **헤딩은 의미 있는 제목**으로 작성 (키워드 포함 권장)
- ❌ 스타일링 목적으로 헤딩 사용 금지 (CSS 사용)

### 4.3 헤딩 구조 테스트

- Chrome 개발자 도구 → Accessibility → Headings
- [HeadingsMap Chrome Extension](https://chrome.google.com/webstore/detail/headingsmap/)

---

## 5. 이미지 최적화

### 5.1 Next.js Image 컴포넌트 사용

```typescript
import Image from "next/image";

<Image
  src={performance.posterUrl}
  alt={performance.name} // ✅ 필수: 의미 있는 alt 텍스트
  width={300}
  height={400}
  loading="lazy" // 지연 로딩
  placeholder="blur" // 블러 효과
  blurDataURL="/placeholder.jpg"
/>
```

### 5.2 OG 이미지 최적화

- **권장 크기**: 1200x630px
- **파일 형식**: PNG, JPG (WebP 권장)
- **파일 크기**: 300KB 이하
- **위치**: `/public/images/meta/`

### 5.3 이미지 alt 텍스트 규칙

- ✅ 이미지 내용을 명확히 설명
- ✅ 키워드 자연스럽게 포함
- ❌ "이미지", "사진" 등 불필요한 단어 제외
- ❌ 키워드 스터핑 금지

---

## 6. URL 구조

### 6.1 RESTful URL 설계

```
✅ 올바른 URL
/performances/123
/search?category=musical
/mypage/bookings

❌ 잘못된 URL
/performance.php?id=123
/search?q=뮤지컬&type=1&sort=asc
/mypage/bookingList
```

### 6.2 URL 규칙

- ✅ **소문자 사용** (kebab-case)
- ✅ **의미 있는 경로** (키워드 포함)
- ✅ **계층 구조** 명확히
- ❌ 쿼리 파라미터 남용 금지
- ❌ 세션 ID, 불필요한 파라미터 제외

### 6.3 PAGES 상수 사용

**위치**: `@/shared/config/routes.ts`

```typescript
import { PAGES } from "@/shared/config";

// ✅ 올바른 방식
<Link href={PAGES.PERFORMANCE.DETAIL(id)}>

// ❌ 잘못된 방식
<Link href={`/performances/${id}`}>
```

---

## 7. 체크리스트

### 7.1 새 페이지 개발 시

- [ ] **메타데이터 설정**
  - [ ] title (60자 이내)
  - [ ] description (160자 이내)
  - [ ] openGraph 설정 (이미지 1200x630)
  - [ ] twitter 카드 설정
  - [ ] robots 메타태그
- [ ] **헤딩 구조**
  - [ ] h1 태그 1개만 사용
  - [ ] 순차적 헤딩 계층 (h1 → h2 → h3)
- [ ] **구조화된 데이터**
  - [ ] 적절한 JSON-LD 스키마 추가
  - [ ] safeJsonLdStringify() 사용
  - [ ] Google Rich Results Test 통과
- [ ] **사이트맵**
  - [ ] SERVICE_PAGES에 추가 (정적 페이지)
  - [ ] 동적 사이트맵 생성 (동적 페이지)
- [ ] **이미지**
  - [ ] Next/Image 컴포넌트 사용
  - [ ] 의미 있는 alt 텍스트
  - [ ] OG 이미지 최적화 (1200x630)
- [ ] **URL**
  - [ ] RESTful 구조
  - [ ] PAGES 상수 사용
- [ ] **성능**
  - [ ] Server Component 우선
  - [ ] ISR/SSR 적용 (동적 콘텐츠)
  - [ ] 이미지 최적화

### 7.2 SEO 진단 도구

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Naver 웹마스터 도구](https://searchadvisor.naver.com/)

---

## 관련 문서

- [공연 상세 SEO 체크리스트](../tech/performance-seo-checklist.md)
- [Sitemap 설정](../tech/sitemap.md)
- [SEO + Streaming](../tech/seo-streaming.md)
- [SEO PRD](../prd/seo/prd.md)
