# 문서 인덱스

> AI가 기능 추가/수정 시 이 파일을 업데이트합니다.
> 새 기능 구현 전 `document/prd/{기능명}/prd.md`를 생성하고 이 인덱스에 등록하세요.

---

## PRD 목록

### 서비스 (사용자 기능)

| 기능 | 문서 | 상태 | 최종 수정 |
|------|------|------|-----------|
| 공연 예매 프로세스 | [prd/booking/prd.md](prd/booking/prd.md) | 🟡 부분 완료 (이슈 4건) | 2026-01-12 |
| 홈 섹션 탭 | [prd/home-section-tabs/prd.md](prd/home-section-tabs/prd.md) | ✅ 완료 | - |
| 마이페이지 예매 내역 | [prd/mypage-booking-history/prd.md](prd/mypage-booking-history/prd.md) | 🔲 미구현 | - |
| 위시리스트 | [prd/wishlist/prd.md](prd/wishlist/prd.md) | 🔲 미구현 | - |
| 공연 검색 | [prd/performance-search/prd.md](prd/performance-search/prd.md) | 🔲 미구현 | - |

### 관리자 기능

| 기능 | 문서 | 상태 | 최종 수정 |
|------|------|------|-----------|
| 공지사항 CRUD | [prd/admin-notices/prd.md](prd/admin-notices/prd.md) | ✅ 완료 | - |
| 홈 태그 관리 (지정 + 순서) | [prd/admin-tag-management/prd.md](prd/admin-tag-management/prd.md) | 🟡 태그 지정 완료 / 순서 관리 미구현 | 2026-03-18 |

### 인프라

| 기능 | 문서 | 상태 | 최종 수정 |
|------|------|------|-----------|
| 공연 캐싱 전략 (ISR + On-Demand) | [prd/performance-caching/prd.md](prd/performance-caching/prd.md) | ✅ 완료 | - |
| SEO 최적화 | [prd/seo/prd.md](prd/seo/prd.md) | 🔴 색인 이슈 발생 (메인 도메인) | 2026-04-10 |

---

## 상태 범례

| 아이콘 | 의미 |
|--------|------|
| ✅ | 완료 |
| 🟡 | 부분 완료 / 진행 중 |
| 🔲 | 미구현 |
| 🔴 | 블로커 있음 |

---

## 기술 문서

| 문서 | 설명 |
|------|------|
| [tech/api-architecture.md](tech/api-architecture.md) | API 아키텍처 |
| [tech/fsd-official.md](tech/fsd-official.md) | FSD 공식 문서 종합 |
| [tech/msw-setup.md](tech/msw-setup.md) | MSW 설정 |
| [tech/seo-streaming.md](tech/seo-streaming.md) | SEO + Streaming |
| [tech/admin-auth.md](tech/admin-auth.md) | 관리자 인증 프로세스 |
| [tech/fsd-refactoring.md](tech/fsd-refactoring.md) | FSD 리팩토링 가이드 |
| [tech/next-image.md](tech/next-image.md) | Next.js 이미지 최적화 |
| [tech/orval.md](tech/orval.md) | Orval 설정 |
| [tech/performance-seo-checklist.md](tech/performance-seo-checklist.md) | 공연 상세 SEO 체크리스트 |
| [tech/seo-indexing-issues.md](tech/seo-indexing-issues.md) | 🔴 SEO 색인 이슈 분석 및 해결 |
| [tech/seat-chart-library.md](tech/seat-chart-library.md) | 좌석 배치도 라이브러리 |
| [tech/sitemap.md](tech/sitemap.md) | 사이트맵 설정 |

## 개발 가이드

| 문서 | 설명 |
|------|------|
| [guide/fsd-architecture.md](guide/fsd-architecture.md) | FSD 구조 및 디렉토리 예시 |
| [guide/zod-schema.md](guide/zod-schema.md) | Zod 스키마 설계 |
| [guide/import-rules.md](guide/import-rules.md) | Import & Export 규칙 |
| [guide/seo.md](guide/seo.md) | SEO 최적화 개발 가이드 |
