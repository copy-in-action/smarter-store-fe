# 좌석 차트 라이브러리 (Seat Chart Library)

> `src/shared/lib/seat/` - FSD 아키텍처 기반 좌석 관리 시스템

## 개요

좌석 차트 라이브러리는 공연장, 영화관 등의 좌석 배치도를 관리하고 실시간 예매 상태를 표시하는 React 컴포넌트 라이브러리입니다. TypeScript로 작성되었으며 Next.js SSR을 완벽 지원합니다.

## 핵심 기능

### 🎯 주요 기능
- **정적 좌석 배치도 설정**: 행/열, 좌석 등급, 간격 설정
- **실시간 예매 상태**: 예약됨/진행중/선택됨/비활성화 상태 관리
- **반응형 UI**: 모바일/데스크톱 최적화, 줌 컨트롤
- **다중 모드**: 편집 모드(관리자) / 보기 모드(사용자)
- **SSR 지원**: Next.js App Router 완벽 호환

### 📊 좌석 상태 체계
- `available`: 선택 가능한 좌석
- `selected`: 사용자가 선택한 좌석
- `reserved`: 이미 예약된 좌석 (결제 완료)
- `pending`: 구매 진행 중인 좌석 (임시 점유)
- `disabled`: 물리적으로 존재하지 않는 좌석

## 아키텍처

```
src/shared/lib/seat/
├── components/           # React 컴포넌트들
│   ├── SeatChart.tsx            # 🔥 코어 좌석 차트
│   ├── BookingSeatChart.tsx     # 예매용 좌석 차트
├── hooks/               # React 훅들
│   └── useSeatChart.ts         # 좌석 차트 상태 관리
├── types/               # TypeScript 타입 정의
│   └── seatLayout.types.ts     # 모든 인터페이스 정의
├── utils/               # 유틸리티 함수들
│   ├── seatChart.utils.ts      # 좌석 상태/타입 유틸리티
│   └── seatConverters.ts       # BE 연동용 변환 함수
├── constants/           # 상수 정의
│   └── seatChart.constants.ts  # 색상 등 상수
└── index.ts            # Public API Export
```

## 사용법

### 1. 기본 좌석 차트 렌더링

```typescript
import { SeatChart } from '@/shared/lib/seat';
import type { SeatChartConfig } from '@/shared/lib/seat';

// 좌석 차트 설정
const seatConfig: SeatChartConfig = {
  rows: 10,
  columns: 20,
  mode: "view",
  seatTypes: {
    vip: { label: "VIP", price: 100000 },
    premium: { label: "프리미엄", price: 80000 },
    standard: { label: "일반", price: 60000 }
  },
  seatGrades: [
    { seatTypeKey: "vip", position: "1:2:" },      // 1-2행
    { seatTypeKey: "premium", position: "3:5:" },  // 3-5행
    { seatTypeKey: "standard", position: "6::" }   // 6행 이후
  ],
  disabledSeats: [{ row: 0, col: 0 }, { row: 0, col: 19 }],
  reservedSeats: [{ row: 1, col: 5 }],
  pendingSeats: [{ row: 1, col: 6 }],
  selectedSeats: [],
  rowSpacers: [5],      // 5행 뒤에 간격
  columnSpacers: [10]   // 10열 뒤에 간격
};

function SeatPage() {
  const handleSeatClick = (row: number, col: number) => {
    console.log(`좌석 클릭: ${row + 1}행 ${col + 1}열`);
  };

  return (
    <SeatChart 
      config={seatConfig}
      onSeatClick={handleSeatClick}
    />
  );
}
```

### 2. 실시간 예매 시스템 (SSR)

```typescript
// Server Component
export default async function BookingPage({ params }: { params: { venueId: string } }) {
  // 서버에서 정적 배치도 로드
  const staticVenue = await getStaticVenue(params.venueId);
  
  return <BookingSeatView venueId={params.venueId} staticVenue={staticVenue} />;
}
```

```typescript
// Client Component 
"use client";

import { useSeatChart } from '@/shared/lib/seat';

interface BookingSeatViewProps {
  venueId: string;
  staticVenue: StaticSeatVenue;
}

function BookingSeatView({ venueId, staticVenue }: BookingSeatViewProps) {
  const { 
    seatChartConfig,
    toggleSeatSelection,
    userSelection,
    isLoading 
  } = useSeatChart(venueId);

  if (isLoading || !seatChartConfig) {
    return <div>좌석 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <SeatChart 
        config={seatChartConfig}
        onSeatClick={toggleSeatSelection}
      />
      
      <div className="mt-4">
        <h3>선택된 좌석: {userSelection.selectedSeats.length}개</h3>
        {userSelection.selectedSeats.map(seat => (
          <div key={`${seat.row}-${seat.col}`}>
            {seat.row + 1}행 {seat.col + 1}열
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 데이터 구조

### 좌석 위치 표현

```typescript
// 좌석 위치 (0-based index)
interface SeatPosition {
  row: number;    // 0부터 시작하는 행 번호
  col: number;    // 0부터 시작하는 열 번호
}

// 좌석 등급 설정 (1-based 사용자 입력)
interface SeatGradeConfig {
  seatTypeKey: string;
  position: string;  // "3:" (3행 전체), ":5" (5열 전체), "3:5" (3행5열)
}
```

### 좌석 등급 설정 예시

```typescript
// 극장 좌석 등급 설정
seatGrades: [
  { seatTypeKey: "vip", position: "1:" },      // 1행
  { seatTypeKey: "premium", position: "10:" },   // 10행 전체 (프리미엄)
]
```

## 백엔드 연동

### 데이터 저장 형태

```typescript
import { convertForBEStorage, extractSeatGradeInfo } from '@/shared/lib/seat';

// 1. 관리자가 설정한 배치도를 BE용으로 변환
const beData = convertForBEStorage(step1Data);

// 결과:
// {
//   layoutJson: StaticSeatVenue,           // JSON으로 저장
//   seatGrades: SeatGradeForBE[],    // 별도 테이블로 저장
//   summary: {                       // 통계 정보
//     totalSeats: 200,
//     availableSeats: 180,
//     disabledSeats: 20,
//     gradeCount: 3
//   }
// }
```

### 실시간 예매 상태 API

```typescript
// GET /api/seat-venues/{venueId}
// 정적 배치도 조회
interface StaticVenueResponse extends StaticSeatVenue {}

// GET /api/seat-venues/{venueId}/booking-status  
// 실시간 예매 상태 조회 (SSE)
interface BookingStatusResponse extends BookingStatus {
  reservedSeats: SeatPosition[];
  pendingSeats: SeatPosition[];
}
```

## API 레퍼런스

### 컴포넌트

#### `<SeatChart />`
좌석 차트의 핵심 컴포넌트입니다.

**Props:**
- `config: SeatChartConfig` - 좌석 차트 전체 설정
- `onSeatClick?: (row: number, col: number) => void` - 좌석 클릭 핸들러

**Features:**
- 반응형 디자인 (모바일/데스크톱)
- 줌 컨트롤 (모바일에서 +/- 버튼)
- 호버 툴팁 (데스크톱에서 좌석 정보 표시)
- 접근성 지원 (키보드 네비게이션)

#### `<BookingSeatChart />`
예매 전용 좌석 차트 컴포넌트입니다.


### 훅

#### `useSeatChart(venueId: string)`
좌석 차트 데이터와 상태를 관리하는 훅입니다.

**반환값:**
```typescript
{
  // 데이터
  staticVenue: StaticSeatVenue | null;
  bookingStatus: BookingStatus;
  userSelection: UserSeatSelection;
  seatChartConfig: SeatChartConfig | null;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  toggleSeatSelection: (row: number, col: number) => void;
  clearSelection: () => void;
  updateBookingStatus: (status: BookingStatus) => void;
}
```

**기능:**
- 서버에서 정적 배치도 로드
- SSE를 통한 실시간 예매 상태 수신
- 사용자 좌석 선택 상태 관리

#### `useSeatStatus(seatChartConfig)`
좌석 상태 유틸리티 훅입니다.

**반환값:**
```typescript
{
  isSeatInState: (row: number, col: number, seats: SeatPosition[]) => boolean;
  getSeatStatus: (row: number, col: number) => SeatStatus;
  isSeatClickable: (row: number, col: number) => boolean;
}
```

### 유틸리티 함수

#### 좌석 상태 관련
```typescript
// 좌석이 특정 상태 배열에 있는지 확인
isSeatInState(row: number, col: number, seats: SeatPosition[]): boolean

// 좌석의 등급(타입) 결정
getSeatType(row: number, col: number, config: SeatChartConfig): string

// 좌석 위치를 문자열로 변환
seatPositionToString(seat: SeatPosition): string

// 좌석 위치 문자열 유효성 검사
validateSeatPosition(position: string, config: SeatChartConfig): boolean
```

#### 백엔드 연동 관련
```typescript
// Step1 데이터에서 등급별 좌석 수 추출
extractSeatGradeInfo(step1Data: StaticSeatVenue): SeatGradeForBE[]

// BE 저장용 데이터로 변환
convertForBEStorage(step1Data: StaticSeatVenue): BEStorageData

// BE 데이터를 Step1 형태로 복원
restoreStaticSeatVenue(jsonData: StaticSeatVenue, gradeInfo?: SeatGradeForBE[]): StaticSeatVenue

// 배치도 수정 시 등급 정보 변경 감지
checkGradeInfoUpdates(oldData: StaticSeatVenue, newData: StaticSeatVenue): UpdateCheckResult
```

## 성능 최적화

### 1. React 최적화
- `useState`와 `useCallback`을 활용한 리렌더링 최소화
- 좌석 클릭 시 컴포넌트 전체 재렌더링 방지
- 터치 이벤트와 마우스 이벤트 중복 처리 방지

### 2. SSR 최적화
- 정적 배치도는 서버에서 사전 로드
- 동적 데이터(예매 상태)만 클라이언트에서 SSE로 수신
- Next.js 캐싱 전략 활용

### 3. 메모리 최적화
- 대용량 좌석 배치도 처리 시 가상화 고려
- 불필요한 좌석 상태 계산 최소화
- 이벤트 핸들러 메모리 리크 방지