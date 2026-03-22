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
        페스티벌 · 경기
```

- **PerformanceAutocompleteResponse 기반** (최대 6개)
- **공연 썸네일 이미지** (`mainImageUrl`)
- **공연명** (`title` - 검색어 **볼드 처리**)
- **카테고리 · 지역** (`category` · `regionName`)

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
← [뒤로가기]  [NOL 티켓 ✕] 검색어  🏠
```

- **뒤로가기 버튼**: 이전 페이지로 이동
- **검색창**:
  - 입력된 검색어 유지 및 재검색 가능
  - 선택된 필터를 태그 형태로 표시 (예: "NOL 티켓 ✕")
  - 태그 클릭 시 해당 필터 제거
- **홈 버튼**: 메인 페이지로 이동

#### 필터 및 정렬 버튼 영역
```
[🎭 필터]  [↕️ 정렬]
```

- **필터 버튼**: 클릭 시 필터 다이얼로그 오픈
- **정렬 버튼**: 클릭 시 정렬 다이얼로그 오픈

### 3.3 필터 다이얼로그 (Filter Dialog)

#### UI 구조
```
[필터]                                    [✕]

판매 상태
  [판매중]  [판매종료]

장르
  [뮤지컬]  [연극]  [야음/가족]

지역
  [서울]  [경기]  [인천]  [경남]  [부산]  [경북]
  [대구]  [전남]  [광주]  [전북]  [세종]  [충남]
  [대전]  [충북]  [강원]  [제주]  [울산]

[초기화]           [125개 상품 보기]
```

#### 동작 방식
- **필터 선택**:
  - 다중 선택 가능 (토글 버튼)
  - 선택 시 즉시 API 호출 (`/api/performances/search`)
  - 실시간으로 `totalElements` 반영하여 하단 버튼 텍스트 업데이트
  - 예: "125개 상품 보기" → "87개 상품 보기"

- **초기화 버튼**:
  - 필터 중 **하나라도 선택된 경우만 활성화**
  - 클릭 시 모든 필터 초기화
  - 비활성화 상태: 회색 처리

- **N개 상품 보기 버튼**:
  - 필터 적용 및 다이얼로그 닫기
  - 검색 결과 리스트 업데이트

#### 필터 항목 매핑
- **판매 상태** (`status`):
  - 판매중 → `ON_SALE`
  - 판매종료 → `CLOSED`

- **장르** (`category`):
  - 뮤지컬, 연극, 야음/가족 등 (String 배열)
  - API 응답 기반 동적 생성 가능

- **지역** (`region`):
  - Region enum 17개 광역자치단체
  - SEOUL(서울), GYEONGGI(경기), INCHEON(인천), GYEONGNAM(경남), BUSAN(부산), GYEONGBUK(경북), DAEGU(대구), JEONNAM(전남), GWANGJU(광주), JEONBUK(전북), SEJONG(세종), CHUNGNAM(충남), DAEJEON(대전), CHUNGBUK(충북), GANGWON(강원), JEJU(제주), ULSAN(울산)

### 3.4 정렬 다이얼로그 (Sort Dialog)

#### UI 구조
```
[정렬]                                    [✕]

  예매 많은 순                              ✓
  종료 임박 순
  최근 등록 순
```

#### 동작 방식
- **단일 선택**: 하나의 정렬 방식만 선택 가능
- **선택 시 즉시 적용**: 다이얼로그 닫히고 검색 결과 정렬 업데이트

#### 정렬 옵션 매핑
- **예매 많은 순** → `BOOKING_COUNT` (기본값)
- **종료 임박 순** → `END_DATE_ASC`
- **최근 등록 순** → `CREATED_AT_DESC`

### 3.5 검색 결과 리스트

#### UI 구조 (2열 그리드)
```
┌─────────────┐  ┌─────────────┐
│  [이미지]    │  │  [이미지]    │
│  뮤지컬      │  │  뮤지컬      │
│  공연명      │  │  공연명      │
│  📅 날짜     │  │  📅 날짜     │
│  📍 장소     │  │  📍 장소     │
│  [판매중]    │  │  [판매종료]  │
└─────────────┘  └─────────────┘
```

#### 공연 카드 구성 (PerformanceSearchResponse 기반)
- **공연 이미지** (`mainImageUrl`):
  - 썸네일 이미지
  - 비율: 16:9 또는 3:4
  - 이미지 없을 시 기본 플레이스홀더

- **카테고리 라벨** (`category`):
  - 상단 좌측 배지 형태
  - 예: "뮤지컬", "연극", "콘서트"

- **공연명** (`title`):
  - 최대 2줄 표시
  - 초과 시 말줄임(...) 처리

- **공연 기간** (`startDate` - `endDate`):
  - 형식: `2025.03.29-2026.08.30`
  - 아이콘: 📅

- **공연장 정보** (`regionName` · `venueAddress`):
  - 형식: `서울 · 서울숲 씨어터 1관`
  - 아이콘: 📍
  - 최대 1줄, 초과 시 말줄임

- **판매 상태 뱃지**:
  - `판매중` (ON_SALE): 파란색 배지
  - `판매종료` (CLOSED): 회색 배지
  - 카드 하단 우측 배치

### 3.6 무한 스크롤
- **스크롤 시 추가 검색 결과 로드** (무한 스크롤)
  - `hasNextPage`를 활용한 다음 페이지 확인
  - `page` 파라미터 증가 (0-based)
  - React Query의 `useInfiniteQuery` 활용

### 3.7 빈 상태 (Empty State)
```
🔍
검색 결과가 없습니다
다른 검색어로 시도해보세요
```

- 검색 결과가 없을 경우 표시
- 안내 메시지 및 재검색 유도

### 3.8 동작 흐름
- **공연 카드 클릭**: 공연 상세 페이지로 이동 (`/performances/{id}`)
- **필터 버튼 클릭**: 필터 다이얼로그 오픈
- **필터 선택**:
  1. 선택된 필터로 즉시 API 호출
  2. `totalElements` 반영하여 "N개 상품 보기" 업데이트
  3. "N개 상품 보기" 클릭 시 필터 적용 및 다이얼로그 닫기
- **정렬 버튼 클릭**: 정렬 다이얼로그 오픈
- **정렬 선택**: 즉시 정렬 적용 및 다이얼로그 닫기
- **검색창 재입력**: 새로운 검색 실행 (검색창은 Header의 SearchInput 재사용)
- **필터 태그 삭제**: 태그 클릭 시 해당 필터 제거 및 검색 결과 업데이트
- **초기화 버튼**: 모든 필터 초기화 (필터 선택 시만 활성화)

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
│           │   └── search.queries.ts        # React Query hooks (orval API 래핑)
│           ├── model/
│           │   └── recent-search.ts         # 최근 검색 쿠키 관리
│           └── index.ts                     # Public API
│
├── views/
│   └── service/
│       └── search-results/             # ✅ 검색 결과 페이지 (신규)
│           ├── ui/
│           │   ├── SearchResultsPage.tsx    # 메인 페이지 (SSR)
│           │   ├── SearchHeader.tsx         # 헤더 (뒤로가기, 검색창, 홈)
│           │   ├── FilterBar.tsx            # 필터/정렬 버튼 영역
│           │   ├── FilterDialog.tsx         # 필터 다이얼로그
│           │   ├── SortDialog.tsx           # 정렬 다이얼로그
│           │   ├── SearchResultsList.tsx    # 검색 결과 리스트 (무한 스크롤)
│           │   └── PerformanceSearchCard.tsx # 공연 검색 카드
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
'use client';

import { useState } from 'react';
import { useDebounce } from '@/shared/lib/hooks';
import { SearchAutocomplete } from '@/features/service/performance-search';
import { Input } from '@/shared/ui/input';

/**
 * 헤더 검색창 컴포넌트
 * - 검색어 입력 및 디바운싱
 * - 자동완성 팝오버 통합
 */
export function SearchInput() {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);

  return (
    <div className="relative">
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="공연, 장소 검색"
      />
      <SearchAutocomplete keyword={debouncedKeyword} />
    </div>
  );
}
```

**features/service/performance-search/ui/SearchAutocomplete.tsx** (신규)
```typescript
'use client';

import { Popover } from '@/shared/ui/popover';
import { RecentSearches } from './RecentSearches';
import { PerformanceResults } from './PerformanceResults';

/**
 * 검색 자동완성 팝오버 컴포넌트
 * - 검색어 미입력: 최근 검색 영역 표시
 * - 검색어 입력: 공연 검색 결과 표시 (최대 6개)
 */
export function SearchAutocomplete({ keyword }: { keyword: string }) {
  return (
    <Popover>
      {!keyword ? <RecentSearches /> : <PerformanceResults keyword={keyword} />}
    </Popover>
  );
}
```

**views/service/search-results/ui/FilterDialog.tsx** (신규)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useSearchInfiniteQuery } from '@/features/service/performance-search';
import { formatRegionName } from '@/shared/lib/region';
import type { PerformanceSearchStatus, Region } from '@/shared/api/orval/types';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: {
    status?: PerformanceSearchStatus[];
    category?: string[];
    region?: Region[];
  };
  onApplyFilters: (filters: typeof currentFilters) => void;
}

/**
 * 필터 다이얼로그 컴포넌트
 * - 실시간 totalElements 표시
 * - 초기화 버튼은 필터 선택 시만 활성화
 */
export function FilterDialog({ open, onOpenChange, currentFilters, onApplyFilters }: FilterDialogProps) {
  const [selectedFilters, setSelectedFilters] = useState(currentFilters);

  // 실시간 totalElements 조회
  const { data } = useSearchQuery({
    ...selectedFilters,
    page: 0,
    size: 1, // 최소한의 데이터만 가져옴
  });

  const totalElements = data?.totalElements ?? 0;
  const hasFilters = !!(selectedFilters.status?.length || selectedFilters.category?.length || selectedFilters.region?.length);

  const handleReset = () => {
    setSelectedFilters({ status: [], category: [], region: [] });
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>필터</DialogTitle>
        </DialogHeader>

        {/* 판매 상태 */}
        <div>
          <h3>판매 상태</h3>
          {/* 판매중, 판매종료 토글 버튼 */}
        </div>

        {/* 장르 */}
        <div>
          <h3>장르</h3>
          {/* 뮤지컬, 연극, 야음/가족 토글 버튼 */}
        </div>

        {/* 지역 */}
        <div>
          <h3>지역</h3>
          {/* 17개 지역 토글 버튼 (한글 매핑) */}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasFilters}
          >
            초기화
          </Button>
          <Button onClick={handleApply} className="flex-1">
            {totalElements}개 상품 보기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**views/service/search-results/ui/SortDialog.tsx** (신규)
```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { PerformanceSearchSort } from '@/shared/api/orval/types';
import { Check } from 'lucide-react';

interface SortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSort: PerformanceSearchSort;
  onSelectSort: (sort: PerformanceSearchSort) => void;
}

const SORT_OPTIONS = [
  { label: '예매 많은 순', value: PerformanceSearchSort.BOOKING_COUNT },
  { label: '종료 임박 순', value: PerformanceSearchSort.END_DATE_ASC },
  { label: '최근 등록 순', value: PerformanceSearchSort.CREATED_AT_DESC },
];

/**
 * 정렬 다이얼로그 컴포넌트
 * - 단일 선택
 * - 선택 시 즉시 적용 및 다이얼로그 닫기
 */
export function SortDialog({ open, onOpenChange, currentSort, onSelectSort }: SortDialogProps) {
  const handleSelect = (sort: PerformanceSearchSort) => {
    onSelectSort(sort);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정렬</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full flex items-center justify-between p-3 hover:bg-accent"
            >
              <span>{option.label}</span>
              {currentSort === option.value && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.2 API 엔드포인트

#### 자동완성 API
```typescript
GET /api/performances/search/autocomplete?keyword={검색어}

// Request Params
interface AutocompleteParams {
  keyword?: string;
}

// Response: PerformanceAutocompleteResponse[]
[
  {
    id: 123,                                    // 공연 ID
    title: "어린이 서커스 마술쇼 - 서울 강동",  // 공연 제목
    mainImageUrl: "...",                        // 대표 이미지 URL
    category: "뮤지컬",                         // 카테고리
    regionName: "서울"                          // 지역명 (17개 행정구역)
  }
]

// 최대 6개 결과 반환
```

#### 검색 결과 API
```typescript
GET /api/performances/search?request={PerformanceSearchRequest}

// Request: PerformanceSearchRequest
interface PerformanceSearchRequest {
  keyword?: string;                        // 검색어 (제목, 카테고리, 공연장 주소 통합 검색)
  status?: PerformanceSearchStatus[];      // 판매 상태 필터 (다중 선택)
  category?: string[];                     // 장르 필터 (다중 선택)
  region?: Region[];                       // 지역 필터 (다중 선택)
  sort?: PerformanceSearchSort;            // 정렬 방식
  page: number;                            // 페이지 번호 (0-based)
  size: number;                            // 페이지 크기
}

// PerformanceSearchStatus (판매 상태)
enum PerformanceSearchStatus {
  UPCOMING = 'UPCOMING',      // 판매 예정
  ON_SALE = 'ON_SALE',        // 판매 중
  CLOSED = 'CLOSED'           // 판매 종료
}

// Region (17개 광역자치단체)
enum Region {
  SEOUL = 'SEOUL',
  INCHEON = 'INCHEON',
  DAEJEON = 'DAEJEON',
  DAEGU = 'DAEGU',
  GWANGJU = 'GWANGJU',
  ULSAN = 'ULSAN',
  BUSAN = 'BUSAN',
  SEJONG = 'SEJONG',
  GYEONGGI = 'GYEONGGI',
  GANGWON = 'GANGWON',
  CHUNGBUK = 'CHUNGBUK',
  CHUNGNAM = 'CHUNGNAM',
  JEONBUK = 'JEONBUK',
  JEONNAM = 'JEONNAM',
  GYEONGBUK = 'GYEONGBUK',
  GYEONGNAM = 'GYEONGNAM',
  JEJU = 'JEJU'
}

// PerformanceSearchSort (정렬 방식)
enum PerformanceSearchSort {
  BOOKING_COUNT = 'BOOKING_COUNT',        // 예약 수 기준 (인기순)
  END_DATE_ASC = 'END_DATE_ASC',          // 종료일 빠른 순
  CREATED_AT_DESC = 'CREATED_AT_DESC'     // 등록일 최신순
}

// Response: PerformanceSearchListResponse
{
  content: [                               // 검색 결과 목록
    {
      id: 123,                             // 공연 ID
      title: "어린이 서커스 마술쇼",        // 공연 제목
      mainImageUrl: "...",                 // 공연 대표 이미지 URL
      category: "뮤지컬",                  // 카테고리
      regionName: "서울",                  // 지역명
      venueAddress: "서울 강동구 ...",     // 공연장 주소
      startDate: "2026-04-01",             // 공연 시작일
      endDate: "2026-06-30"                // 공연 종료일
    }
  ],
  totalElements: 42,                       // 전체 데이터 개수
  hasNextPage: true                        // 다음 페이지 존재 여부
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

### 4.4 주요 라이브러리 및 API 타입
- **Shadcn UI**: Popover, Input, Button, Dialog, Badge, ScrollArea
- **React Query**: 검색 API 상태 관리 (`@tanstack/react-query`)
- **쿠키 관리**: `js-cookie` 또는 Next.js의 `cookies()`
- **URL 상태 관리**: Next.js `useSearchParams` 또는 `useRouter`
- **API 타입** (Orval 자동 생성):
  ```typescript
  // src/shared/api/orval/types에서 import
  import type {
    PerformanceAutocompleteResponse,
    PerformanceSearchListResponse,
    PerformanceSearchRequest,
    PerformanceSearchResponse,
    PerformanceSearchStatus,
    PerformanceSearchSort,
    Region,
    AutocompleteParams,
    SearchParams
  } from '@/shared/api/orval/types';

  // API 함수
  import { search, autocomplete } from '@/shared/api/orval/performance-search';
  ```

### 4.5 React Query Hooks 예시
```typescript
// features/service/performance-search/api/search.queries.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { search, autocomplete } from '@/shared/api/orval/performance-search';
import type { AutocompleteParams, SearchParams } from '@/shared/api/orval/types';

/**
 * 자동완성 검색 Query Hook
 */
export const useAutocompleteQuery = (keyword?: string) => {
  return useQuery({
    queryKey: ['performance', 'autocomplete', keyword],
    queryFn: () => autocomplete({ keyword }),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 공연 검색 Query Hook (일반)
 */
export const useSearchQuery = (params: SearchParams['request']) => {
  return useQuery({
    queryKey: ['performance', 'search', params],
    queryFn: () => search({ request: params }),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 공연 검색 Infinite Query Hook (무한 스크롤용)
 */
export const useSearchInfiniteQuery = (
  baseParams: Omit<SearchParams['request'], 'page' | 'size'>
) => {
  return useInfiniteQuery({
    queryKey: ['performance', 'search', 'infinite', baseParams],
    queryFn: ({ pageParam = 0 }) =>
      search({
        request: { ...baseParams, page: pageParam, size: 20 }
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.hasNextPage ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};
```

### 4.6 URL 상태 관리

검색 결과 페이지는 필터/정렬 상태를 URL 쿼리 파라미터로 관리하여:
- 뒤로가기/앞으로가기 시 상태 복원
- URL 공유 가능
- 북마크 가능

#### URL 쿼리 파라미터 구조
```typescript
/search?q=일산탕&status=ON_SALE&category=뮤지컬&category=연극&region=SEOUL&region=GYEONGGI&sort=BOOKING_COUNT

쿼리 파라미터:
- q: 검색어 (String)
- status: 판매 상태 (PerformanceSearchStatus[], 다중 선택)
- category: 장르 (String[], 다중 선택)
- region: 지역 (Region[], 다중 선택)
- sort: 정렬 (PerformanceSearchSort, 단일 선택, 기본값: BOOKING_COUNT)
```

#### 상태 동기화 로직
```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 필터 상태 읽기
  const keyword = searchParams.get('q') ?? '';
  const status = searchParams.getAll('status') as PerformanceSearchStatus[];
  const category = searchParams.getAll('category');
  const region = searchParams.getAll('region') as Region[];
  const sort = (searchParams.get('sort') as PerformanceSearchSort) ?? PerformanceSearchSort.BOOKING_COUNT;

  // 필터 변경 시 URL 업데이트
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    params.set('q', keyword);
    if (newFilters.status?.length) newFilters.status.forEach(s => params.append('status', s));
    if (newFilters.category?.length) newFilters.category.forEach(c => params.append('category', c));
    if (newFilters.region?.length) newFilters.region.forEach(r => params.append('region', r));
    params.set('sort', newFilters.sort ?? sort);

    router.push(`/search?${params.toString()}`);
  };

  // ...
}
```

## 5. 추가 고려사항

### 5.1 성능 최적화
- **디바운싱**: 검색어 입력 후 300-500ms 후 API 호출
- **캐싱**: React Query를 활용한 검색 결과 캐싱
- **무한 스크롤**: `useInfiniteQuery` 활용
- **실시간 totalElements 조회**: 필터 선택 시마다 API 호출 (디바운싱 300ms 적용 권장)

### 5.2 접근성 (Accessibility)
- 키보드 네비게이션 지원 (↑↓ 키로 자동완성 항목 이동)
- ARIA 라벨 추가 (`role="combobox"`, `aria-autocomplete`)

### 5.3 모바일 최적화
- 반응형 UI (모바일/태블릿/데스크톱)
- 터치 제스처 지원

### 5.4 SEO
- **검색 결과 페이지**: 서버 사이드 렌더링 (SSR)
- **메타 태그**:
  - `<title>"{검색어}" 검색 결과 | Smarter Store</title>`
  - `<meta name="description" content="{검색어}에 대한 공연 {totalElements}개 검색 결과">`
- **Canonical URL**: 필터 상태가 포함된 현재 URL
- **Open Graph**: 검색 결과 공유 시 메타 정보 표시

## 6. 개발 우선순위

### Phase 1: 검색창 및 자동완성 (MVP)

#### 1) features/service/performance-search 구현
- [ ] `SearchAutocomplete.tsx` - 자동완성 팝오버 컴포넌트
- [ ] `RecentSearches.tsx` - 최근 검색 영역
- [ ] `PerformanceResults.tsx` - 공연 검색 결과 (PerformanceAutocompleteResponse 활용)
- [ ] `search.queries.ts` - React Query hooks (orval API 래핑)
  - `useAutocompleteQuery` - autocomplete() 래핑
  - `useSearchQuery` - search() 래핑
- [ ] `recent-search.ts` - 최근 검색 쿠키 관리

#### 2) widgets/header/ui/SearchInput.tsx 수정
- [ ] 기존 검색창에 `SearchAutocomplete` 통합
- [ ] 포커스/입력 상태 관리
- [ ] 검색어 입력 디바운싱 (300-500ms)

#### 3) API 타입 활용
- [ ] `@/shared/api/orval/types`에서 타입 import
- [ ] orval 생성 API 함수 (`search`, `autocomplete`) 활용

### Phase 2: 검색 결과 페이지

#### 1) 페이지 및 레이아웃 구성
- [ ] `views/service/search-results` 페이지 생성
- [ ] `SearchResultsPage.tsx` - 메인 페이지 (SSR, URL 쿼리 파라미터 처리)
- [ ] `SearchHeader.tsx` - 헤더 영역
  - 뒤로가기 버튼
  - 검색창 (SearchInput 재사용)
  - 선택된 필터 태그 표시 및 삭제
  - 홈 버튼
- [ ] `FilterBar.tsx` - 필터/정렬 버튼 영역

#### 2) 필터 및 정렬 다이얼로그
- [ ] `FilterDialog.tsx` - 필터 다이얼로그 (Shadcn Dialog)
  - 판매 상태 필터 (PerformanceSearchStatus enum)
  - 장르 필터 (category, 다중 선택)
  - 지역 필터 (Region enum, 다중 선택, 한글 매핑)
  - 실시간 totalElements 표시 ("N개 상품 보기")
  - 초기화 버튼 (필터 선택 시만 활성화)
- [ ] `SortDialog.tsx` - 정렬 다이얼로그 (Shadcn Dialog)
  - BOOKING_COUNT (예매 많은 순)
  - END_DATE_ASC (종료 임박 순)
  - CREATED_AT_DESC (최근 등록 순)

#### 3) 검색 결과 리스트
- [ ] `SearchResultsList.tsx` - 검색 결과 리스트
  - useSearchInfiniteQuery 활용 (무한 스크롤)
  - hasNextPage로 다음 페이지 확인
  - 2열 그리드 레이아웃
  - 로딩 상태, 에러 상태, 빈 상태 처리
- [ ] `PerformanceSearchCard.tsx` - 공연 검색 카드 (신규)
  - 이미지 (mainImageUrl)
  - 카테고리 라벨 (category)
  - 공연명 (title, 2줄 말줄임)
  - 공연 기간 (startDate - endDate)
  - 공연장 정보 (regionName · venueAddress)
  - 판매 상태 뱃지 (ON_SALE/CLOSED)

#### 4) 상태 관리 및 URL 동기화
- [ ] URL 쿼리 파라미터로 필터/정렬 상태 관리
  - `q`: 검색어
  - `status`: 판매 상태 (배열)
  - `category`: 장르 (배열)
  - `region`: 지역 (배열)
  - `sort`: 정렬 방식
- [ ] useSearchParams 또는 Next.js router로 URL 업데이트
- [ ] 필터/정렬 변경 시 URL 및 검색 결과 동기화

### Phase 3: 고도화
- [ ] 검색어 강조 (Highlighting)
- [ ] 키보드 네비게이션 (↑↓ 키)
- [ ] 접근성 (ARIA 라벨)
- [ ] 검색 분석 (인기 검색어, 검색 통계)

---

## 7. 검색 결과 페이지 핵심 요구사항 요약

### UI/UX
- ✅ **헤더**: 뒤로가기, 검색창 (필터 태그 포함), 홈 버튼
- ✅ **필터 다이얼로그**: 판매 상태, 장르, 지역 (다중 선택)
  - 실시간 totalElements 표시 ("N개 상품 보기")
  - 초기화 버튼 (필터 선택 시만 활성화)
- ✅ **정렬 다이얼로그**: 예매 많은 순, 종료 임박 순, 최근 등록 순 (단일 선택)
- ✅ **검색 결과**: 2열 그리드, 무한 스크롤
- ✅ **공연 카드**: 이미지, 카테고리, 제목, 날짜, 장소, 판매 상태 뱃지

### 기술 사항
- ✅ **URL 상태 관리**: 쿼리 파라미터로 필터/정렬 상태 유지
- ✅ **실시간 API 호출**: 필터 선택 시마다 totalElements 조회
- ✅ **무한 스크롤**: useInfiniteQuery + hasNextPage
- ✅ **지역 한글 매핑**: Region enum → 한글 지역명 (formatRegionName 활용)
- ✅ **SSR**: 서버 사이드 렌더링으로 SEO 최적화

### API 연동
- ✅ **검색 API**: `/api/performances/search` (PerformanceSearchRequest)
- ✅ **필터 파라미터**: status[], category[], region[], sort
- ✅ **응답 활용**: totalElements (상품 개수), hasNextPage (무한 스크롤)

---

## 8. 기존 파일 활용 전략

### 재사용 가능한 기존 컴포넌트
- ✅ `widgets/header/ui/SearchInput.tsx` - 검색창 UI (수정하여 활용)
- ✅ `entities/performance/ui/PerformanceCard.tsx` - 공연 카드 (재사용)
- ✅ `shared/ui/popover` - Shadcn Popover (자동완성 영역)
- ✅ `shared/ui/input` - Shadcn Input (검색 입력)

### FSD 원칙 준수
- **widgets → features 의존**: SearchInput이 SearchAutocomplete를 import
- **features → entities 의존**: PerformanceResults가 Performance 타입/API 사용
- **Public API 사용**: index.ts를 통한 import만 허용
