# PRD: 홈 페이지 섹션 태그 기반 공연 리스트 기능

## 1. 개요

### 1.1 기능명
홈 페이지 섹션 태그 기반 공연 리스트

### 1.2 목표
홈 페이지에서 `/api/home/sections` API를 통해 섹션별 태그 기반의 동적 공연 리스트를 제공하여, 사용자가 관심사에 맞는 공연을 쉽게 탐색할 수 있도록 합니다.

### 1.3 대상 사용자
- 모든 홈 페이지 방문자 (로그인 불필요)

### 1.4 비즈니스 가치
- 공연 발견성(Discoverability) 향상
- 사용자 맞춤형 콘텐츠 제공을 통한 전환율 증대
- 관리자가 설정한 섹션/태그 구조를 통한 유연한 콘텐츠 큐레이션
- 사용자 체류 시간 증가

---

## 2. 요구사항

### 2.1 기능 요구사항

#### FR-1: 섹션 표시
- `/api/home/sections` API를 통해 모든 섹션 데이터를 서버 사이드에서 페칭
- 각 섹션은 `displayOrder`에 따라 오름차순으로 정렬되어 표시
- 섹션의 `displayName`을 `<h3>` 태그로 제목 표시
- 각 섹션은 독립적인 `<section>` HTML 태그로 래핑

#### FR-2: 태그 탭 UI
- 각 섹션의 태그들은 Shadcn Tabs 컴포넌트를 사용하여 탭으로 표시
- 태그는 `displayOrder`에 따라 오름차순으로 정렬
- 각 탭의 라벨은 태그의 `displayName` 사용
- 첫 번째 태그가 기본 선택 상태

#### FR-3: 탭 디자인
- 선택된 탭: Primary 색상의 텍스트
- 선택되지 않은 탭: Muted 색상의 텍스트
- 배경 스타일 없음 (투명)
- 탭 간 간격: 16px (gap-4)

#### FR-4: 공연 리스트 표시
- 선택된 태그의 `performances` 배열을 기존 `PerformanceListClient` 패턴과 동일하게 렌더링
- 공연 카드 구성:
  - 메인 이미지 (`mainImageUrl`)
  - 공연 제목 (`title`)
  - 공연장명 (`venue.name`)
- 각 카드는 공연 상세 페이지로 링크

#### FR-5: 반응형 레이아웃
- **모바일 (< 640px)**:
  - 2x2 그리드 레이아웃 (4개 공연씩 묶음)
  - 캐러셀로 페이지 전환
  - 화살표 네비게이션 표시
- **데스크톱 (≥ 640px)**:
  - 가로 스크롤 캐러셀
  - 개별 공연 카드 단위 스크롤
  - 화살표 네비게이션 표시

#### FR-6: 탭 전환
- 탭 클릭 시 네트워크 요청 없이 클라이언트 사이드에서 즉시 전환
- 선택된 태그의 공연 리스트만 표시

#### FR-7: 기존 섹션 유지
- 기존 "추천 공연" 섹션은 새로운 섹션들 하단에 유지
- 기존 MainBanner, PerformanceCategory 컴포넌트는 그대로 유지

### 2.2 비기능 요구사항

#### NFR-1: 성능
- 서버 사이드 렌더링(SSR)으로 초기 로딩 최적화
- Suspense boundary를 통한 스트리밍 렌더링
- 이미지 lazy loading 적용

#### NFR-2: 사용자 경험
- 로딩 중: 스켈레톤 UI 표시
- 빈 섹션: 적절한 안내 메시지 표시
- 빈 공연: "공연이 없습니다" 메시지 표시
- 탭 전환: 100ms 이내 응답

#### NFR-3: 접근성
- Radix UI의 ARIA 속성 기본 제공
- 키보드 네비게이션 지원 (Tab 키로 탭 이동)
- 스크린 리더 호환성

#### NFR-4: 호환성
- 모던 브라우저 지원 (Chrome, Firefox, Safari, Edge 최신 2개 버전)
- 모바일 브라우저 지원 (iOS Safari, Chrome Mobile)

---

## 3. 데이터 구조

### 3.1 API 엔드포인트

**URL**: `GET /api/home/sections`

**응답 구조**:

```typescript
HomeSectionsResponse {
  sections: HomeSectionResponse[]
}

HomeSectionResponse {
  section: 'POPULAR_TICKET' | 'DATE_COURSE' | 'RECOMMENDED' | 'REGION'
  displayName: string          // "인기 티켓", "데이트 코스", "추천", "지역별"
  displayOrder: number         // 표시 순서 (작을수록 먼저 표시)
  tags: HomeTagWithPerformancesResponse[]
}

HomeTagWithPerformancesResponse {
  tag: string                  // "WEEKLY_OPEN", "MUSICAL", "CONCERT" 등
  displayName: string          // "금주 오픈 티켓", "뮤지컬", "콘서트" 등
  displayOrder: number         // 표시 순서 (작을수록 먼저 표시)
  performances: HomePerformanceResponse[]
}

HomePerformanceResponse {
  id: number
  title: string
  mainImageUrl?: string
  venue?: {
    name: string
  }
  // ... 기타 PerformanceResponse 필드
}
```

### 3.2 섹션 타입

| 섹션 코드 | 표시명 | 설명 |
|-----------|--------|------|
| `POPULAR_TICKET` | 인기 티켓 | 인기 있는 공연 모음 |
| `DATE_COURSE` | 데이트 코스 | 데이트하기 좋은 공연 모음 |
| `RECOMMENDED` | 추천 | 추천 공연 모음 |
| `REGION` | 지역별 | 지역별 공연 모음 |

### 3.3 태그 예시

| 태그 코드 | 표시명 | 섹션 |
|-----------|--------|------|
| `WEEKLY_OPEN` | 금주 오픈 티켓 | POPULAR_TICKET |
| `MUSICAL` | 뮤지컬 | POPULAR_TICKET |
| `CONCERT` | 콘서트 | POPULAR_TICKET |
| `DATE_MUSICAL` | 데이트: 뮤지컬 | DATE_COURSE |
| `DATE_THEATER` | 데이트: 연극 | DATE_COURSE |
| `REGION_SEOUL` | 지역: 서울 | REGION |
| `REGION_BUSAN` | 지역: 부산 | REGION |

---

## 4. 사용자 플로우

### 4.1 기본 플로우

```
1. 사용자가 홈 페이지 접속
   ↓
2. 서버에서 /api/home/sections 데이터 페칭 (SSR)
   ↓
3. 섹션들이 displayOrder 순서대로 렌더링
   ↓
4. 각 섹션의 첫 번째 태그가 기본 선택된 상태로 표시
   ↓
5. 사용자가 다른 태그 클릭
   ↓
6. 클라이언트 사이드에서 즉시 탭 전환 (네트워크 요청 없음)
   ↓
7. 선택된 태그의 공연 리스트 표시
   ↓
8. 사용자가 공연 카드 클릭
   ↓
9. 공연 상세 페이지로 이동
```

### 4.2 엣지 케이스

#### Case 1: 빈 섹션 배열
- **조건**: `sections` 배열이 비어있음
- **처리**: "섹션을 불러올 수 없습니다" 메시지 표시

#### Case 2: 섹션은 있지만 태그가 없음
- **조건**: 특정 섹션의 `tags` 배열이 비어있음
- **처리**: 해당 섹션 스킵 (렌더링하지 않음)

#### Case 3: 태그는 있지만 공연이 없음
- **조건**: 특정 태그의 `performances` 배열이 비어있음
- **처리**: "공연이 없습니다" 메시지 표시

#### Case 4: API 실패
- **조건**: `/api/home/sections` 호출 실패
- **처리**: 빈 배열 반환 (graceful degradation), 기존 "추천 공연" 섹션은 정상 작동

---

## 5. 화면 설계

### 5.1 레이아웃 구조

```
┌─────────────────────────────────────┐
│ 헤더                                 │
├─────────────────────────────────────┤
│ CIA 티켓 (제목)                      │
├─────────────────────────────────────┤
│ 카테고리 캐러셀                       │
├─────────────────────────────────────┤
│ 메인 배너                            │
├─────────────────────────────────────┤
│ [새 기능] 인기 티켓                   │ ← Section 1
│ ┌─────────────────────────────────┐ │
│ │ [금주 오픈]  [뮤지컬]  [콘서트]  │ │ ← Tabs
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 공연 캐러셀                       │ │ ← Performance List
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [새 기능] 데이트 코스                 │ ← Section 2
│ ┌─────────────────────────────────┐ │
│ │ [뮤지컬]  [연극]  [클래식]       │ │ ← Tabs
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 공연 캐러셀                       │ │ ← Performance List
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [기존] 추천 공연                      │ ← Existing Section
│ ┌─────────────────────────────────┐ │
│ │ 공연 캐러셀                       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 푸터                                 │
└─────────────────────────────────────┘
```

### 5.2 탭 UI 상세

#### 선택되지 않은 탭
```
[금주 오픈]  [뮤지컬]  [콘서트]
   gray       gray      gray
```

#### 선택된 탭 (예: 뮤지컬)
```
[금주 오픈]  [뮤지컬]  [콘서트]
   gray      primary     gray
```

---

## 6. 기술 스택 & 아키텍처

### 6.1 기술 스택
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn UI (Radix UI 기반)
- **Styling**: Tailwind CSS
- **State Management**: React useState (로컬 상태)
- **Data Fetching**: Server Component (SSR)
- **Image Optimization**: Next.js Image

### 6.2 FSD 아키텍처

```
src/
├── entities/
│   └── home-section/                     (Entity: API 함수)
│       ├── api/
│       │   └── home-section.server.api.ts
│       └── index.ts
│
├── features/
│   └── service/
│       └── home-section-list/            (Feature: UI + 로직)
│           ├── ui/
│           │   ├── HomeSectionListServer.tsx
│           │   ├── HomeSectionListClient.tsx
│           │   ├── HomeSectionListSkeleton.tsx
│           │   └── HomeSectionEmpty.tsx
│           ├── model/
│           │   └── home-section.types.ts
│           ├── lib/
│           │   └── home-section.utils.ts
│           └── index.ts
│
└── views/
    └── service/
        └── home/
            └── HomePage.tsx               (View: 통합)
```

### 6.3 컴포넌트 계층

```
HomePage (Server Component)
└── <Suspense fallback={<HomeSectionListSkeleton />}>
    └── HomeSectionListServer (Server Component)
        └── HomeSectionListClient (Client Component)
            └── map(sections)
                └── SectionBlock
                    ├── <h3>{displayName}</h3>
                    └── <Tabs>
                        ├── <TabsList>
                        │   └── <TabsTrigger> × N
                        └── <TabsContent>
                            └── PerformanceCarousel
                                └── PerformanceCard × N
```

---

## 7. 성공 지표

### 7.1 개발 완료 기준
- [x] 모든 섹션이 displayOrder 순서대로 표시됨
- [x] 태그 탭이 displayOrder 순서대로 표시됨
- [x] 첫 번째 태그가 기본 선택됨
- [x] 탭 전환 시 네트워크 요청 없음
- [x] 선택된 탭만 텍스트 색상 변경 (배경 없음)
- [x] 공연 카드가 기존 패턴과 동일하게 표시됨
- [x] 모바일/데스크톱 반응형 정상 작동
- [x] 기존 "추천 공연" 섹션 정상 작동
- [x] Hydration 에러 없음
- [x] 콘솔 에러/경고 없음

### 7.2 사용자 경험 기준
- 섹션 로딩 시간 < 1초
- 탭 전환 응답 시간 < 100ms
- 이미지 로딩 최적화 적용
- 스켈레톤 UI 적절히 표시

### 7.3 비즈니스 지표 (추후 측정)
- 홈 페이지 체류 시간 증가
- 공연 상세 페이지 전환율 증가
- 섹션별 클릭률(CTR) 측정

---

## 8. 일정 & 마일스톤

### Phase 1: Foundation
- PRD 문서 작성
- Entity API 함수 구현
- 타입 & 유틸리티 함수 구현

### Phase 2: UI Components
- Empty/Skeleton 컴포넌트 구현
- Client 컴포넌트 구현 (핵심)
- Server 컴포넌트 구현

### Phase 3: Integration
- HomePage 통합
- 테스트 & 검증

---

## 9. 리스크 & 대응 방안

### Risk 1: API 응답 지연
- **리스크**: `/api/home/sections` API 응답이 느릴 경우 페이지 로딩 지연
- **대응**: Suspense boundary로 스트리밍 렌더링, 다른 섹션 먼저 표시

### Risk 2: 빈 데이터
- **리스크**: 섹션/태그/공연 데이터가 비어있을 경우 빈 화면 표시
- **대응**: 각 레벨에서 빈 상태 처리, 적절한 안내 메시지 표시

### Risk 3: Hydration 에러
- **리스크**: 서버/클라이언트 컴포넌트 혼용 시 hydration mismatch
- **대응**: 파일 분리 (Server/Client), initialData 정확히 전달

### Risk 4: 성능 이슈
- **리스크**: 많은 섹션/공연으로 인한 렌더링 성능 저하
- **대응**: 이미지 lazy loading, 캐러셀 가상화 (필요시)

---

## 10. 향후 개선 사항

### 단기 (1-2개월)
- 섹션별 "더 보기" 링크 추가
- 태그별 공연 개수 표시
- 사용자 선호 태그 저장 (로컬 스토리지)

### 중기 (3-6개월)
- 개인화 추천 섹션 추가
- 섹션별 A/B 테스트 구현
- 무한 스크롤 적용 (더 보기 대체)

### 장기 (6개월 이상)
- AI 기반 개인화 추천
- 실시간 인기 공연 업데이트
- 사용자 행동 분석 기반 섹션 순서 최적화

---

## 11. 참고 자료

### API 문서
- `/api/home/sections` - 홈 섹션 조회 API
- Orval 생성 타입: `HomeSectionsResponse`, `HomeSectionResponse`, `HomeTagWithPerformancesResponse`

### 기존 구현
- `PerformanceListClient.tsx` - 공연 리스트 패턴 참고
- `PerformanceListServer.tsx` - 서버 컴포넌트 패턴 참고
- `performance.server.api.ts` - 서버 API 패턴 참고

### FSD 문서
- `CLAUDE.md` - 프로젝트 FSD 가이드
- `document/fsd/` - FSD 아키텍처 문서

---

## 12. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-01-27 | Claude Sonnet 4.5 | 초기 PRD 작성 |

---

**승인자**: (승인 필요)
**검토자**: (검토 필요)
