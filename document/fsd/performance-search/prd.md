# 공연 검색 기능 PRD (Product Requirements Document)

## 1. 개요

### 1.1 목적
사용자가 원하는 공연을 빠르고 편리하게 검색할 수 있도록 검색 기능을 제공합니다.

### 1.2 범위
- 검색창 UI 및 자동완성 기능
- 최근 검색어 관리
- 검색 결과 리스트 페이지

## 2. 검색창 및 자동완성 (Search Input & Autocomplete)

### 2.1 검색창 UI

#### 기본 구조
- 검색 아이콘 (돋보기)
- 필터 태그 영역 (예: "NOL 티켓" - 삭제 가능)
- 검색어 입력 필드
- 전체 삭제 버튼 (검색어 입력 시 표시)

#### 동작
- 검색창 클릭/포커스 시 자동완성 영역(Popover) 표시
- Popover 컴포넌트를 활용하여 구현
- 검색창 외부 클릭 시 자동완성 영역 닫힘

### 2.2 최근 검색 (Recent Searches)

#### 표시 조건
- 검색어가 **입력되지 않은 상태**에서만 표시
- 검색창 포커스 시 자동으로 표시

#### 데이터 저장
- **쿠키 기반**으로 최근 검색어 저장
- 저장 형식: `검색어 + 검색 날짜` (정렬 목적)
- 최대 **4개**까지 표시 (최신순)

#### UI 구성
```
최근 검색                        [전체삭제]
⏱️ 서울                           ✕
⏱️ 뮤지컬                         ✕
⏱️ 콘서트                         ✕
```

- **헤더**: "최근 검색" 라벨 + "전체삭제" 버튼
- **검색어 항목**: 시계 아이콘 + 검색어 텍스트 + 개별 삭제 버튼(✕)

#### 동작
- **검색어 클릭**: 해당 검색어로 검색 실행
- **개별 삭제 버튼**: 해당 검색어만 삭제
- **전체삭제 버튼**: 모든 최근 검색어 삭제
- **빈 상태**: "최근 검색 내역이 없어요" 메시지 표시

### 2.3 자동완성 (Autocomplete)

#### 표시 조건
- 검색어가 **1자 이상 입력**된 경우 표시
- 실시간으로 검색 결과 업데이트 (디바운싱 적용 권장)

#### 공연 검색 결과 (Performance Results)
```
[이미지] 어린이 서커스 마술쇼 - 서울 강동
        뮤지컬 · 서울

[이미지] 뮤지컬 코러스 서울
        콘서트 · 서울

[이미지] 워터밤 서울 2026
        콘서트 · 경기
```

- **공연 썸네일 이미지**
- **공연명** (검색어 **볼드 처리**)
- **공연 장소** (카테고리 · 지역)

#### 동작
- **공연 항목 클릭**: 공연 상세 페이지로 이동
- **Enter 키 입력**: 검색 리스트 페이지로 이동

#### 검색어 강조 (Highlighting)
- 입력한 검색어와 일치하는 부분을 **볼드(Bold)** 처리
- 예: "서울" 입력 시 → "**서울**재즈페스티벌"

## 3. 검색 결과 리스트 페이지 (Search Results Page)

### 3.1 진입 경로
- 검색창에서 **Enter 키** 입력
- URL: `/search?q={검색어}` (쿼리 파라미터)

### 3.2 페이지 구조

#### 헤더 영역
```
← [뒤로가기]  🔍 검색창 (입력된 검색어 유지)
```

- 뒤로가기 버튼
- 검색창 (검색어 유지, 재검색 가능)

#### 검색 결과 헤더
```
"검색어"에 대한 검색 결과 (총 42개)
```

- 검색어 표시
- 검색 결과 개수 표시

#### 필터 및 정렬
```
[카테고리 ▼] [지역 ▼] [날짜 ▼]          [최신순 ▼]
```

- **필터**:
  - 카테고리 (뮤지컬, 콘서트, 전시 등)
  - 지역 (서울, 경기, 부산 등)
  - 날짜 (진행 중, 예정, 전체)

- **정렬**:
  - 최신순 (등록일 기준)
  - 인기순 (조회수/예매율 기준)
  - 날짜순 (공연 시작일 기준)

#### 검색 결과 리스트
```
[공연 이미지]  공연명
              카테고리 · 장소
              2026.04.01 - 2026.06.30
              ⭐ 4.5 (128)

[공연 이미지]  공연명
              ...
```

- **공연 카드 형태**로 표시
- **공연 이미지** (썸네일)
- **공연명** (검색어 강조)
- **카테고리 · 장소**
- **공연 기간**
- **평점 및 리뷰 수**
- **찜하기 버튼** (하트 아이콘)

#### 무한 스크롤 또는 페이지네이션
- 스크롤 시 추가 검색 결과 로드 (무한 스크롤 권장)
- 또는 페이지네이션 UI 제공

#### 빈 상태 (Empty State)
```
🔍
검색 결과가 없습니다
다른 검색어로 시도해보세요
```

- 검색 결과가 없을 경우 표시
- 안내 메시지 및 재검색 유도

### 3.3 동작
- **공연 카드 클릭**: 공연 상세 페이지로 이동
- **필터/정렬 변경**: 검색 결과 즉시 업데이트
- **검색창 재입력**: 새로운 검색 실행

## 4. 기술 스펙

### 4.1 FSD 아키텍처

#### 레이어별 역할 및 의존성
```
widgets/header (검색창 UI)
    ↓ import
features/service/performance-search (검색 로직)
    ↓ import
entities/performance (공연 도메인)
```

#### 디렉토리 구조
```
src/
├── widgets/
│   └── header/
│       └── ui/
│           └── SearchInput.tsx         # 🔵 기존 활용 (검색창 UI + features 통합)
│
├── features/
│   └── service/
│       └── performance-search/         # ✅ 검색 기능 (신규)
│           ├── ui/
│           │   ├── SearchAutocomplete.tsx   # 자동완성 팝오버 (Popover)
│           │   ├── RecentSearches.tsx       # 최근 검색 영역
│           │   └── PerformanceResults.tsx   # 공연 검색 결과
│           ├── api/
│           │   ├── search.api.ts            # 검색 API 함수
│           │   └── search.queries.ts        # React Query hooks
│           ├── model/
│           │   ├── search.types.ts          # 검색 관련 타입
│           │   └── recent-search.ts         # 최근 검색 쿠키 관리
│           └── index.ts                     # Public API
│
├── views/
│   └── service/
│       └── search-results/             # ✅ 검색 결과 페이지 (신규)
│           ├── ui/
│           │   ├── SearchResultsPage.tsx    # 메인 페이지
│           │   ├── SearchResultsList.tsx    # 검색 결과 리스트
│           │   └── SearchFilters.tsx        # 필터 및 정렬
│           └── index.ts
│
└── entities/
    └── performance/
        ├── ui/
        │   └── PerformanceCard.tsx     # 🔵 기존 활용 (공연 카드 재사용)
        └── ...
```

#### 컴포넌트 통합 방식

**widgets/header/ui/SearchInput.tsx** (기존 파일 수정)
```typescript
import { SearchAutocomplete } from '@/features/service/performance-search';

export function SearchInput() {
  return (
    <div className="relative">
      <Input ... />  {/* 기존 검색 입력 UI */}
      <SearchAutocomplete />  {/* features의 자동완성 통합 */}
    </div>
  );
}
```

**features/service/performance-search/ui/SearchAutocomplete.tsx** (신규)
```typescript
import { Popover } from '@/shared/ui/popover';
import { RecentSearches } from './RecentSearches';
import { PerformanceResults } from './PerformanceResults';

export function SearchAutocomplete() {
  return (
    <Popover>
      {검색어 없음 ? <RecentSearches /> : <PerformanceResults />}
    </Popover>
  );
}
```

### 4.2 API 엔드포인트

#### 자동완성 API
```
GET /api/search/autocomplete?q={검색어}

Response:
{
  "performances": [
    {
      "id": 123,
      "title": "어린이 서커스 마술쇼 - 서울 강동",
      "category": "뮤지컬",
      "location": "서울",
      "imageUrl": "...",
      "venue": "강동아트센터"
    }
  ]
}
```

#### 검색 결과 API
```
GET /api/search/performances?q={검색어}&category={카테고리}&location={지역}&sort={정렬}&page={페이지}

Response:
{
  "total": 42,
  "performances": [...],
  "hasMore": true
}
```

### 4.3 최근 검색어 저장 (쿠키)

```typescript
// 쿠키 구조
{
  name: "recent_searches",
  value: JSON.stringify([
    { keyword: "서울", searchedAt: "2026-03-05T10:30:00Z" },
    { keyword: "뮤지컬", searchedAt: "2026-03-05T09:15:00Z" }
  ]),
  maxAge: 30 * 24 * 60 * 60 // 30일
}
```

### 4.4 주요 라이브러리
- **Shadcn UI**: Popover, Input, Button
- **React Query**: 검색 API 상태 관리
- **쿠키 관리**: `js-cookie` 또는 Next.js의 `cookies()`

## 5. 추가 고려사항

### 5.1 성능 최적화
- **디바운싱**: 검색어 입력 후 300-500ms 후 API 호출
- **캐싱**: React Query를 활용한 검색 결과 캐싱
- **무한 스크롤**: `useInfiniteQuery` 활용

### 5.2 접근성 (Accessibility)
- 키보드 네비게이션 지원 (↑↓ 키로 자동완성 항목 이동)
- ARIA 라벨 추가 (`role="combobox"`, `aria-autocomplete`)

### 5.3 모바일 최적화
- 반응형 UI (모바일/태블릿/데스크톱)
- 터치 제스처 지원

### 5.4 SEO
- 검색 결과 페이지: 서버 사이드 렌더링 (SSR)
- 메타 태그: `<title>"{검색어}" 검색 결과 | Smarter Store</title>`

## 6. 개발 우선순위

### Phase 1: 검색창 및 자동완성 (MVP)

#### 1) features/service/performance-search 구현
- [ ] `SearchAutocomplete.tsx` - 자동완성 팝오버 컴포넌트
- [ ] `RecentSearches.tsx` - 최근 검색 영역
- [ ] `PerformanceResults.tsx` - 공연 검색 결과
- [ ] `search.api.ts` - 검색 API 함수
- [ ] `search.queries.ts` - React Query hooks
- [ ] `recent-search.ts` - 최근 검색 쿠키 관리

#### 2) widgets/header/ui/SearchInput.tsx 수정
- [ ] 기존 검색창에 `SearchAutocomplete` 통합
- [ ] 포커스/입력 상태 관리
- [ ] 검색어 입력 디바운싱

### Phase 2: 검색 결과 페이지
- [ ] `views/service/search-results` 페이지 생성
- [ ] `SearchResultsPage.tsx` - 메인 페이지
- [ ] `SearchResultsList.tsx` - 검색 결과 리스트
- [ ] `SearchFilters.tsx` - 필터 및 정렬
- [ ] 검색 API 연동 (무한 스크롤)
- [ ] entities/performance의 `PerformanceCard` 재사용

### Phase 3: 고도화
- [ ] 검색어 강조 (Highlighting)
- [ ] 키보드 네비게이션 (↑↓ 키)
- [ ] 접근성 (ARIA 라벨)
- [ ] 검색 분석 (인기 검색어, 검색 통계)

---

## 7. 기존 파일 활용 전략

### 재사용 가능한 기존 컴포넌트
- ✅ `widgets/header/ui/SearchInput.tsx` - 검색창 UI (수정하여 활용)
- ✅ `entities/performance/ui/PerformanceCard.tsx` - 공연 카드 (재사용)
- ✅ `shared/ui/popover` - Shadcn Popover (자동완성 영역)
- ✅ `shared/ui/input` - Shadcn Input (검색 입력)

### FSD 원칙 준수
- **widgets → features 의존**: SearchInput이 SearchAutocomplete를 import
- **features → entities 의존**: PerformanceResults가 Performance 타입/API 사용
- **Public API 사용**: index.ts를 통한 import만 허용
