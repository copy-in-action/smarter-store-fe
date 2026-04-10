# SEO 최적화 PRD

> 검색 엔진 최적화(SEO) 전략 및 구현 현황 문서

---

## 📋 목차

1. [개요](#1-개요)
2. [SEO 전략](#2-seo-전략)
3. [현재 구현 상태](#3-현재-구현-상태)
4. [개선 필요 사항](#4-개선-필요-사항)
5. [구현 체크리스트](#5-구현-체크리스트)

---

## 1. 개요

### 1.1 목적

- 검색 엔진에서의 자연 유입 증대
- 공연 상세 페이지의 검색 노출 최적화
- 사용자 경험 향상 (페이지 로딩 속도, 접근성)
- 소셜 미디어 공유 시 최적화된 미리보기 제공

### 1.2 핵심 지표

| 지표 | 목표 | 현재 상태 |
|------|------|-----------|
| **Google PageSpeed (Mobile)** | 90+ | 측정 필요 |
| **Google PageSpeed (Desktop)** | 95+ | 측정 필요 |
| **Core Web Vitals (LCP)** | < 2.5s | 측정 필요 |
| **사이트맵 커버리지** | 100% | ✅ 완료 |
| **JSON-LD 스키마** | 모든 공연 페이지 | ✅ 완료 |
| **헤딩 구조 정확도** | 100% | ✅ 완료 |
| **구글 색인 (메인 도메인)** | 전체 페이지 | ❌ 색인 중단 |
| **네이버 색인 (테스트 도메인)** | 전체 페이지 | ✅ 공연 상세 색인됨 |

---

## 2. SEO 전략

### 2.1 기술적 SEO

#### 2.1.1 Server-Side Rendering (SSR)

**전략**:
- 모든 공연 상세 페이지는 SSR로 구현
- 검색 엔진이 완전한 HTML 수신
- JavaScript 비활성화 환경에서도 콘텐츠 노출

**구현**:
- Next.js Server Component 사용
- `'use client'` 최소화
- ISR (Incremental Static Regeneration) 적용 (5분 단위)

#### 2.1.2 구조화된 데이터 (JSON-LD)

**전략**:
- Schema.org 표준 준수
- Event + Product 혼합 스키마
- 카테고리별 자동 타입 결정
- XSS 방지

**구현**:
- `@/shared/lib/json-ld.ts`의 유틸리티 함수 사용
- `WebSite`, `Organization`, `Event`, `Product` 스키마 제공

#### 2.1.3 사이트맵 (Sitemap)

**전략**:
- 모든 페이지를 사이트맵에 포함
- 동적 페이지는 50,000개 단위로 분할
- 1시간 캐시로 성능 최적화

**구현**:
- `/sitemap.xml` (인덱스)
- `/sitemap/sitemap.xml` (정적 페이지)
- `/sitemap/performance/[id].xml` (동적 공연 페이지)

### 2.2 콘텐츠 SEO

#### 2.2.1 메타데이터 최적화

**전략**:
- 각 페이지마다 고유한 title, description
- 키워드 자연스럽게 포함
- OG 태그로 소셜 미디어 최적화
- Twitter Card 지원

**구현**:
- 정적 페이지: `@/shared/config/routes.ts`에서 중앙 관리
- 동적 페이지: `generateMetadata()` 함수로 동적 생성

#### 2.2.2 헤딩 구조 (Heading Hierarchy)

**전략**:
- h1은 페이지당 1개만
- 순차적 헤딩 계층 (h1 → h2 → h3)
- 의미 있는 제목 사용

**현재 이슈**:
- ⚠️ 일부 페이지에서 h1 다음 h3 직접 사용 (h2 건너뜀)

#### 2.2.3 이미지 최적화

**전략**:
- Next.js Image 컴포넌트 사용
- 의미 있는 alt 텍스트
- OG 이미지 최적화 (1200x630)
- WebP 포맷 사용

### 2.3 성능 SEO

#### 2.3.1 Core Web Vitals

**목표**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**전략**:
- 이미지 지연 로딩
- Critical CSS 인라인
- JavaScript 번들 최적화
- CDN 활용 (Vercel)

#### 2.3.2 캐싱 전략

**전략**:
- ISR (Incremental Static Regeneration)
- On-Demand Revalidation
- CDN 캐싱
- 브라우저 캐싱

**구현**:
- 공연 상세: 5분 단위 재검증
- 사이트맵: 1시간 캐시
- 정적 자산: 1년 캐시 (immutable)

---

## 3. 현재 구현 상태

### 3.1 완료된 항목 ✅

#### 3.1.1 사이트맵
- ✅ 사이트맵 인덱스 (`/sitemap.xml`)
- ✅ 정적 페이지 사이트맵 (`/sitemap/sitemap.xml`)
- ✅ 동적 공연 사이트맵 (`/sitemap/performance/[id].xml`)
- ✅ 50,000개 단위 자동 분할
- ✅ 1시간 캐시 설정

#### 3.1.2 robots.txt
- ✅ 동적 robots.txt 생성
- ✅ 모든 크롤러 허용
- ✅ 사이트맵 URL 포함

#### 3.1.3 메타데이터
- ✅ 정적 페이지 메타데이터 중앙 관리 (`routes.ts`)
- ✅ 공연 상세 페이지 동적 메타데이터
- ✅ OpenGraph 태그 설정
- ✅ Twitter Card 설정
- ✅ robots 메타태그 명시적 설정

#### 3.1.4 구조화된 데이터
- ✅ JSON-LD 유틸리티 함수 (`json-ld.ts`)
- ✅ XSS 방지 (`safeJsonLdStringify`)
- ✅ WebSite 스키마 (홈페이지)
- ✅ Organization 스키마 (조직 정보)
- ✅ Performance 스키마 (Event + Product)
- ✅ 카테고리별 자동 타입 결정

#### 3.1.5 성능 최적화
- ✅ SSR (Server-Side Rendering)
- ✅ ISR (Incremental Static Regeneration, 5분)
- ✅ On-Demand Revalidation
- ✅ Next.js Image 최적화
- ✅ CDN 캐싱 (Vercel)

#### 3.1.6 검색 엔진 도구
- ✅ Google Search Console 인증 메타 태그
- ✅ Naver 웹마스터 도구 등록

#### 3.1.7 헤딩 구조
- ✅ 공연 상세 페이지 헤딩 구조 수정 완료 (h3 → h2)
- ✅ 순차적 헤딩 계층 준수 (h1 → h2)
- ✅ Logo 컴포넌트 aria-label 중복 제거

---

### 3.2 부분 완료 / 개선 필요 🟡

#### 3.2.1 이미지 alt 텍스트
- ⚠️ 일부 이미지에서 의미 없는 alt 텍스트 사용 가능성
- 📝 **조치 필요**: 전체 이미지 alt 텍스트 점검

#### 3.2.2 OG 이미지
- ⚠️ 기본 OG 이미지 크기 최적화 필요 (1200x630)
- 📝 **조치 필요**: `/public/images/meta/open-graph.png` 확인 및 최적화

#### 3.2.3 Canonical URL
- ⚠️ 중복 콘텐츠 발생 가능한 페이지에서 canonical URL 미설정
- 📝 **조치 필요**: 검색 페이지, 필터링 페이지 등 canonical 설정

#### 3.2.4 검색 엔진 색인 (🔴 Critical Issue)
- 🔴 **메인 도메인 (ticket.devhong.cc)**
  - ❌ 구글 색인 중단 (과거엔 색인됨)
  - ❌ 사이트맵 "가져올 수 없음" 상태
  - ⚠️ 네이버는 메인 페이지만 색인
  - 🔍 **원인 추정**: Cloudflare 설정 이슈 가능성

- ✅ **테스트 도메인 (smarter-store-fe-t5bl.vercel.app)**
  - ⚠️ 구글은 메인/로그인 페이지만 색인
  - ✅ **네이버는 공연 상세 페이지 다수 색인 성공** ⭐
  - ✅ 로고 이미지, OG 이미지 정상 표시
  - 📊 **증거**: "cia 티켓 apink" 검색 시 공연 카드 리스트 표시됨

---

### 3.3 미구현 항목 🔲

#### 3.3.1 Core Web Vitals 측정
- 🔲 Google PageSpeed Insights 테스트
- 🔲 Core Web Vitals 모니터링
- 🔲 성능 개선 계획 수립

#### 3.3.2 접근성 (Accessibility)
- 🔲 WCAG 2.1 AA 기준 준수 점검
- 🔲 스크린 리더 테스트
- 🔲 키보드 네비게이션 테스트

#### 3.3.3 다국어 지원 (향후 고려)
- 🔲 hreflang 태그 설정
- 🔲 다국어 사이트맵

#### 3.3.4 AMP (Accelerated Mobile Pages, 선택적)
- 🔲 AMP 페이지 구현 검토

---

## 4. 개선 필요 사항

### 4.1 긴급 (Critical Priority) 🔴

| 항목 | 이유 | 상세 문서 |
|------|------|-----------|
| **메인 도메인 색인 복구** | 검색 유입 중단, 비즈니스 영향 큼 | [seo-indexing-issues.md](../../tech/seo-indexing-issues.md) |
| **Cloudflare 설정 점검** | Bot Fight Mode 등이 크롤러 차단 가능성 | [seo-indexing-issues.md](../../tech/seo-indexing-issues.md) |

### 4.2 긴급 (High Priority)

| 항목 | 이유 | 예상 소요 시간 |
|------|------|----------------|
| ~~**헤딩 구조 수정**~~ | ~~접근성 및 SEO 영향~~ | ✅ 완료 |
| **Core Web Vitals 측정** | 성능 기준선 파악 | 1시간 |
| **OG 이미지 최적화** | 소셜 미디어 공유 시 중요 | 1시간 |

### 4.3 중요 (Medium Priority)

| 항목 | 이유 | 예상 소요 시간 |
|------|------|----------------|
| **Canonical URL 설정** | 중복 콘텐츠 방지 | 2시간 |
| **이미지 alt 텍스트 점검** | 접근성 및 이미지 검색 | 3-4시간 |
| **성능 개선** | Core Web Vitals 개선 | 4-8시간 |

### 4.4 낮음 (Low Priority)

| 항목 | 이유 | 예상 소요 시간 |
|------|------|----------------|
| **접근성 테스트** | 포괄적 사용자 경험 | 4시간 |
| **다국어 지원** | 향후 확장 | TBD |

---

## 5. 구현 체크리스트

### 5.1 긴급 개선 사항 (Critical)

- [ ] **메인 도메인 색인 복구**
  - [ ] Cloudflare Bot Fight Mode 설정 확인
  - [ ] Cloudflare Firewall Rules에서 검색 엔진 봇 허용 확인
  - [ ] Cloudflare Security Level 조정 (임시: Low)
  - [ ] Cloudflare Cache 설정에서 HTML 캐싱 비활성화
  - [ ] 서버 로그에서 Googlebot/Yeti 접근 기록 확인
  - [ ] 구글 검색 콘솔에서 사이트맵 재제출
  - [ ] 구글 검색 콘솔에서 메인 페이지 색인 요청
  - [ ] 네이버 웹마스터에서 수집 요청

### 5.2 긴급 개선 사항 (High)

- [x] **헤딩 구조 수정** ✅ 완료 (2026-04-10)
  - [x] 공연 상세 페이지 헤딩 h3 → h2 변경
  - [x] Logo 컴포넌트 aria-label 중복 제거
  - [x] 순차적 헤딩 계층 준수 (h1 → h2)

- [ ] **Core Web Vitals 측정**
  - [ ] 홈페이지 PageSpeed Insights 테스트
  - [ ] 공연 상세 페이지 테스트
  - [ ] 검색 페이지 테스트
  - [ ] 측정 결과 문서화

- [ ] **OG 이미지 최적화**
  - [ ] `/public/images/meta/open-graph.png` 크기 확인
  - [ ] 1200x630 크기로 최적화
  - [ ] WebP 포맷 변환 고려
  - [ ] 파일 크기 300KB 이하로 압축

### 5.3 중요 개선 사항

- [ ] **Canonical URL 설정**
  - [ ] 중복 콘텐츠 가능성 있는 페이지 식별
  - [ ] 검색 페이지 canonical 설정
  - [ ] 필터링 페이지 canonical 설정
  - [ ] 정렬 파라미터 페이지 canonical 설정

- [ ] **이미지 alt 텍스트 점검**
  - [ ] 모든 이미지 alt 텍스트 검토
  - [ ] 의미 있는 설명으로 수정
  - [ ] 키워드 자연스럽게 포함
  - [ ] 장식 이미지는 `alt=""` 처리

- [ ] **성능 개선**
  - [ ] 이미지 지연 로딩 확인
  - [ ] JavaScript 번들 크기 분석
  - [ ] Critical CSS 인라인
  - [ ] 불필요한 리렌더링 제거

### 5.4 낮은 우선순위

- [ ] **접근성 테스트**
  - [ ] WCAG 2.1 AA 기준 준수 점검
  - [ ] 스크린 리더 테스트 (NVDA, JAWS)
  - [ ] 키보드 네비게이션 테스트
  - [ ] 색상 대비 검사

- [ ] **다국어 지원 (향후)**
  - [ ] hreflang 태그 설정
  - [ ] 다국어 사이트맵 생성
  - [ ] 언어별 메타데이터 관리

### 5.5 모니터링 및 유지보수

- [ ] **정기 점검**
  - [ ] 월 1회 Google Search Console 확인
  - [ ] 월 1회 Naver 웹마스터 도구 확인
  - [ ] 분기별 PageSpeed Insights 테스트
  - [ ] 분기별 JSON-LD 검증

- [ ] **사이트맵 관리**
  - [ ] 새 페이지 추가 시 사이트맵 업데이트
  - [ ] 사이트맵 제출 확인 (Google, Naver)

- [ ] **메타데이터 관리**
  - [ ] 새 페이지 메타데이터 설정
  - [ ] OG 이미지 업데이트
  - [ ] 키워드 주기적 리뷰

---

## 6. 관련 문서

- [SEO 개발 가이드](../../guide/seo.md) - 개발자를 위한 SEO 가이드
- [SEO 색인 이슈 분석](../../tech/seo-indexing-issues.md) - 🔴 **색인 문제 현황 및 해결 방법**
- [공연 상세 SEO 체크리스트](../../tech/performance-seo-checklist.md)
- [Sitemap 설정](../../tech/sitemap.md)
- [SEO + Streaming](../../tech/seo-streaming.md)

---

## 7. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|-----------|--------|
| 2026-04-10 | 최초 작성 | Claude Code |
| 2026-04-10 | 헤딩 구조 수정 완료, 색인 이슈 추가 | Claude Code |
