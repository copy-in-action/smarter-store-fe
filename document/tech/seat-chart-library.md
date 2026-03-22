# 좌석 차트 라이브러리 (Seat Chart Library)

> `src/shared/lib/seat/` - FSD 아키텍처 기반 좌석 관리 시스템

## 개요

좌석 차트 라이브러리는 공연장, 영화관 등의 좌석 배치도를 관리하고 실시간 예매 상태를 표시하는 React 컴포넌트 라이브러리입니다. TypeScript로 작성되었으며 React Query를 사용한 데이터 패칭, SSE를 통한 실시간 상태 동기화를 지원합니다.

## 핵심 기능

### 🎯 주요 기능
- **정적 좌석 배치도 설정**: 행/열, 좌석 등급, 간격 설정
- **실시간 예매 상태**: SSE를 통한 실시간 좌석 상태 동기화 (OCCUPIED/RELEASED/CONFIRMED)
- **반응형 UI**: 모바일/데스크톱 최적화, 줌 컨트롤
- **다중 모드**: 편집 모드(관리자) / 보기 모드(사용자) / 결제 모드(확인 전용)
- **React Query 통합**: 자동 데이터 패칭, 캐싱, 에러 핸들링
- **좌석 선택 제한**: 최대 4개 선택 제한

### 📊 좌석 상태 체계
- `available`: 선택 가능한 좌석
- `selected`: 사용자가 선택한 좌석
- `reserved`: 이미 예약된 좌석 (결제 완료)
- `pending`: 구매 진행 중인 좌석 (타인이 점유 중, 5분 제한)
- `disabled`: 물리적으로 존재하지 않는 좌석

## 아키텍처

```
src/shared/lib/seat/
├── components/           # React 컴포넌트들
│   ├── SeatChart.tsx            # 🔥 코어 좌석 차트 (편집/보기 모드)
│   └── StaticSeatChart.tsx      # 관리자 배치도 생성/편집
├── hooks/               # React 훅들
│   └── useSeatChart.ts         # 좌석 차트 상태 관리 (React Query)
├── types/               # TypeScript 타입 정의
│   └── seatLayout.types.ts     # 모든 인터페이스 정의
├── utils/               # 유틸리티 함수들
│   ├── seatChart.utils.ts      # 좌석 상태/타입 유틸리티
│   └── seatConverters.ts       # BE 연동용 변환 함수
├── constants/           # 상수 정의
│   └── seatChart.constants.ts  # 색상 등 상수
└── index.ts            # Public API Export

features/service/booking-seating-chart/   # 사용자 예매 기능
├── hooks/
│   ├── useBookingSeatSelection.ts   # 예매 좌석 선택 (SSE 연동)
│   ├── useBookingUIState.ts         # UI 상태 및 데이터 변환
│   └── useBookingStepControl.ts     # Step 제어 및 API 연동
├── ui/
│   ├── BookingSeatingChart.tsx      # 예매 메인 컴포넌트
│   ├── SelectSeatInfo.tsx           # 선택 좌석 정보 표시
│   └── BookingDiscountSelectionForm.tsx  # 할인 선택
├── model/
│   └── booking-step.store.ts        # Zustand: Step 관리
└── lib/
    ├── seatTransformer.ts           # UI 데이터 변환
    └── transformSeatInfo.ts         # 좌석 정보 변환

features/admin/seating-chart/   # 관리자 배치도 생성 기능
├── ui/
│   └── SeatingChartManager.tsx
└── lib/
    └── hooks.ts                     # 관리자용 API 훅
```

## 데이터 구조

### 좌석 위치 표현

```typescript
/**
 * 좌석 위치 (0-based index)
 */
interface SeatPosition {
  row: number;    // 0부터 시작하는 행 번호
  col: number;    // 0부터 시작하는 열 번호
}
```

### 좌석 타입 정의

```typescript
/**
 * 좌석 타입 정의 (정적 데이터)
 */
interface SeatType {
  price?: number;          // 가격 (선택적)
  positions: string[];     // 좌석 위치 배열
}
```

**positions 형식 (1-based index):**
- `"3:"` - 3행 전체
- `":5"` - 5열 전체
- `"3:5"` - 3행 5열 특정 좌석

**등급 결정 우선순위:**
1. 구체적 위치 (`"3:5"`)
2. 행 전체 (`"3:"`)
3. 열 전체 (`":5"`)
4. 기본값 (마지막 등급)

### 정적 좌석 배치도 설정

```typescript
/**
 * 정적 좌석 배치도 설정 (JSON 파일로 저장)
 */
interface StaticSeatVenue {
  /** 총 행 수 */
  rows: number;
  /** 총 열 수 */
  columns: number;
  /** 좌석 타입들 (SeatGrade 키만 허용, 선택적) */
  seatTypes: Partial<Record<SeatGrade, SeatType>>;
  /** 비활성화된 좌석들 (물리적으로 존재하지 않는 좌석) */
  disabledSeats: SeatPosition[];
  /** 행 간격 추가 위치들 */
  rowSpacers: number[];
  /** 열 간격 추가 위치들 */
  columnSpacers: number[];
}
```

### 동적 예매 상태 데이터

```typescript
/**
 * 동적 예매 상태 데이터 (서버에서 실시간으로 받아오는 데이터)
 */
interface BookingStatus {
  /** 예약된 좌석들 (이미 결제 완료) */
  reservedSeats: SeatPosition[];
  /** 구매 진행 중인 좌석들 (임시 점유, 5분 제한) */
  pendingSeats: SeatPosition[];
}
```

### 사용자 선택 좌석 상태

```typescript
/**
 * 사용자 선택 좌석 상태 (클라이언트 상태)
 */
interface UserSeatSelection {
  /** 사용자가 선택한 좌석들 (최대 4개) */
  selectedSeats: SeatPosition[];
}
```

### 좌석 차트 전체 설정

```typescript
/**
 * 좌석 차트 전체 설정 (정적 배치도 + 실시간 예매 상태 + 사용자 선택)
 */
interface SeatChartConfig
  extends StaticSeatVenue,
    BookingStatus,
    UserSeatSelection {
  /** 차트 모드 */
  mode: SeatChartMode;
}

/**
 * 좌석 차트 모드
 */
type SeatChartMode = "edit" | "view" | "payment";
```

### 좌석 상태 타입

```typescript
/**
 * 좌석 상태 타입
 */
type SeatStatus =
  | "available"   // 선택 가능
  | "selected"    // 사용자가 선택
  | "reserved"    // 예약 완료
  | "pending"     // 타인이 점유 중
  | "disabled";   // 비활성화

/**
 * 좌석 선택 제한 설정
 */
export const MAX_SEAT_SELECTION = 4 as const;
```

### SSE 좌석 상태 업데이트

```typescript
/**
 * SSE를 통해 서버에서 전송되는 좌석 상태 변경 이벤트
 */
type SeatStatusByServer = "OCCUPIED" | "RELEASED" | "CONFIRMED";

/**
 * SSE 이벤트 데이터
 */
type BookingStatusByServer = {
  action: SeatStatusByServer;
  seats: SeatPosition[];  // 1-based index
};
```

## 컴포넌트

### SeatChart

좌석 배치도를 렌더링하는 범용 컴포넌트입니다. 편집 모드와 보기 모드를 모두 지원합니다.

**파일:** `src/shared/lib/seat/components/SeatChart.tsx`

**Props:**
```typescript
interface SeatChartProps {
  config: SeatChartConfig;                        // 좌석 차트 설정
  onSeatClick?: (row: number, col: number) => void;  // 좌석 클릭 핸들러
}
```

**주요 기능:**
- 좌석 등급별 색상 구분 (PRESET_COLORS 사용)
- 좌석 상태별 스타일링
- 줌 인/아웃 기능 (모바일 전용, 0.5x ~ 2x)
- 좌석 hover 시 상세 정보 툴팁 (데스크톱)
- 터치/마우스 이벤트 처리
- 행/열 간격(spacers) 렌더링
- 반응형 레이아웃

**좌석 상태별 스타일:**
```typescript
disabled:  { backgroundColor: "#9ca3af", borderColor: "#6b7280" }
reserved:  { backgroundColor: "#e5e7eb", borderColor: "#9ca3af" }
pending:   { backgroundColor: "#fef3c7", borderColor: "#f59e0b" }
selected:  { backgroundColor: baseColor, borderWidth: "2px" }
available: { backgroundColor: "transparent", borderColor: baseColor }
```

**사용 예시:**
```typescript
import { SeatChart } from '@/shared/lib/seat';

function MyPage() {
  const handleSeatClick = (row: number, col: number) => {
    console.log(`좌석 클릭: ${row}행 ${col}열 (0-based)`);
  };

  return (
    <SeatChart
      config={seatChartConfig}
      onSeatClick={handleSeatClick}
    />
  );
}
```

### StaticSeatChart

관리자 페이지에서 공연장 배치도를 생성/편집하는 컴포넌트입니다.

**파일:** `src/shared/lib/seat/components/StaticSeatChart.tsx`

**Props:**
```typescript
interface StaticSeatChartProps {
  initialData?: Partial<StaticSeatVenue>;  // 초기 데이터
  onDataChange: (data: StaticSeatVenue) => void;  // 데이터 변경 핸들러
  onSave?: (data: StaticSeatVenue, gradeInfo: VenueSeatCapacityRequest[]) => Promise<void>;
}
```

**주요 기능:**
- 기본 설정 (행/열 수 입력)
- 좌석 타입 관리 (VIP, R, S, A, B 최대 5개)
  - 색상 선택 (PRESET_COLORS)
  - 좌석 위치 패턴 추가/삭제/수정
- 비활성화 좌석 관리
- 행/열 간격 설정
- 실시간 미리보기 (SeatChart 컴포넌트)
- 등급별 좌석 수 자동 계산 및 표시
- JSON 데이터 미리보기
- Accordion UI로 섹션별 구분

**UI 구조:**
```
┌─────────────────────┬────────────────────┐
│ 설정 패널 (왼쪽)     │ 미리보기 (오른쪽)   │
│ - 기본 설정          │ - SeatChart        │
│ - 좌석 타입 관리     │ - 등급별 좌석 수   │
│ - 비활성화 좌석      │ - JSON 데이터      │
│ - 간격 설정          │                    │
│ - 저장 버튼          │                    │
└─────────────────────┴────────────────────┘
```

## Hooks

### useSeatChart

좌석 차트 데이터와 상태를 관리하는 범용 Hook입니다. React Query를 사용하여 자동으로 데이터를 패칭하고 캐싱합니다.

**파일:** `src/shared/lib/seat/hooks/useSeatChart.ts`

**시그니처:**
```typescript
function useSeatChart(venueId: number, scheduleId?: number)
```

**파라미터:**
- `venueId: number` - 공연장 ID (필수)
- `scheduleId?: number` - 회차 ID (선택, 가격 정보가 필요한 경우 제공)

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
  updateBookingStatus: (status: BookingStatusByServer) => void;
}
```

**내부 동작:**
1. `getSeatingChart(venueId)` 쿼리 실행 (좌석 배치도 조회)
2. `getSchedule(scheduleId)` 쿼리 실행 (scheduleId 제공 시, 가격 정보 조회)
3. 좌석 타입에 가격 정보 병합
4. `useEffect`로 `staticVenue` 상태 업데이트

**쿼리 키:**
- 좌석 배치도: `["seatingChart", venueId]`
- 회차 정보: `["schedule", scheduleId]`

**사용 예시:**
```typescript
import { useSeatChart } from '@/shared/lib/seat';

function BookingPage({ venueId, scheduleId }: Props) {
  const {
    seatChartConfig,
    toggleSeatSelection,
    userSelection,
    isLoading,
    error
  } = useSeatChart(venueId, scheduleId);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!seatChartConfig) return <div>좌석 정보 없음</div>;

  return (
    <>
      <SeatChart
        config={seatChartConfig}
        onSeatClick={toggleSeatSelection}
      />
      <div>선택된 좌석: {userSelection.selectedSeats.length}개</div>
    </>
  );
}
```

### useSeatStatus

좌석 상태 유틸리티 Hook입니다.

**파일:** `src/shared/lib/seat/hooks/useSeatChart.ts`

**시그니처:**
```typescript
function useSeatStatus(seatChartConfig: SeatChartConfig | null)
```

**반환값:**
```typescript
{
  getSeatStatus: (row: number, col: number) => SeatStatus;
  isSeatClickable: (row: number, col: number) => boolean;
}
```

### useBookingSeatSelection

예매 좌석 선택 비즈니스 로직을 담당하는 Hook입니다. `useSeatChart`를 래핑하며 최대 4개 선택 제한과 SSE 실시간 상태 동기화를 추가합니다.

**파일:** `src/features/service/booking-seating-chart/hooks/useBookingSeatSelection.ts`

**시그니처:**
```typescript
function useBookingSeatSelection(venueId: number, scheduleId: number)
```

**주요 기능:**
1. `useSeatChart(venueId, scheduleId)` 호출
2. 좌석 선택 최대 4개 제한 (MAX_SEAT_SELECTION)
3. SSE(Server-Sent Events) 실시간 좌석 상태 구독
   - URL: `getSubscribeSeatEventsUrl(scheduleId)`
   - 이벤트: `seat-update`
   - 자동 재연결 처리
   - cleanup 시 연결 종료

**SSE 연결 관리:**
```typescript
useEffect(() => {
  const eventSource = new EventSource(getSubscribeSeatEventsUrl(scheduleId));

  eventSource.addEventListener("seat-update", (event) => {
    const status: BookingStatusByServer = JSON.parse(event.data);
    // status = { action: "OCCUPIED" | "RELEASED" | "CONFIRMED", seats: [...] }
    updateBookingStatus(status);
  });

  return () => {
    eventSource.close();
  };
}, [scheduleId]);
```

**반환값:** `useSeatChart`와 동일하지만 `toggleSeatSelection`에 4개 제한 로직 추가

### useBookingUIState

예매 UI 상태 및 변환된 데이터를 제공하는 Hook입니다.

**파일:** `src/features/service/booking-seating-chart/hooks/useBookingUIState.ts`

**반환값:**
```typescript
{
  seatChartConfig: SeatChartConfig | null;
  seatGradeInfo: SeatGradeInfo[];          // 등급별 가격 정보
  userSelectedSeats: UserSelectedSeat[];   // 선택 좌석 (등급/가격 포함, 가격순 정렬)
  grades: GradeInfo[];                      // 등급별 그룹화된 좌석 정보
  toggleSeatSelection: (row: number, col: number) => void;
  clearSelection: () => void;
}
```

### useBookingStepControl

예매 프로세스 Step 제어 및 API 연동을 담당하는 Hook입니다. Zustand 스토어와 연동됩니다.

**파일:** `src/features/service/booking-seating-chart/hooks/useBookingStepControl.ts`

**반환값:**
```typescript
{
  step: BookingStep;              // 1 | 2 | 3
  bookingData: BookingResponse | null;
  isLoading: boolean;
  isStarting: boolean;
  isCanceling: boolean;
  handleCompleteSelection: (seats: BookingSeatFormData["seats"]) => void;
  handleBackStep: () => void;
  reset: () => void;
}
```

**Step 전환 로직:**
- Step 1 → 2: `startBooking` API 호출 (좌석 점유)
  - 성공 시 `bookingData` 저장
  - Step 2로 전환
- Step 2 → 1: `cancelBooking` API 호출 (좌석 점유 해제)
  - 성공 시 `bookingData` null
  - Step 1로 전환

## 유틸리티 함수

### 좌석 상태 계산 (`seatChart.utils.ts`)

#### isSeatInState
```typescript
function isSeatInState(
  row: number,
  col: number,
  seats: SeatPosition[]
): boolean
```
좌석이 특정 상태 배열에 포함되어 있는지 확인합니다.

#### getSeatType
```typescript
function getSeatType(
  row: number,
  col: number,
  config: SeatChartConfig
): SeatGrade
```
좌석의 타입(등급)을 결정합니다.

**알고리즘:**
1. 구체적 위치 매칭 (`"3:5"`)
2. 행 전체 매칭 (`"3:"`)
3. 열 전체 매칭 (`":5"`)
4. 기본값 (마지막 등급)

#### seatPositionToString
```typescript
function seatPositionToString(seat: SeatPosition): string
```
SeatPosition → `"행,열"` 문자열 변환

#### validateSeatPosition
```typescript
function validateSeatPosition(
  position: string,
  config: SeatChartConfig
): boolean
```
좌석 위치 문자열 유효성 검사

### 백엔드 연동 관련 (`seatConverters.ts`)

#### extractSeatGradeInfo
```typescript
function extractSeatGradeInfo(
  staticSeatVenue: StaticSeatVenue
): VenueSeatCapacityRequest[]
```
StaticSeatVenue에서 등급별 좌석 수를 계산합니다.

**알고리즘:**
1. 모든 좌석 위치 순회 (0 ~ rows-1, 0 ~ columns-1)
2. 비활성화 좌석 제외
3. 각 좌석의 등급 판별 (`getSeatType`)
4. 등급별 카운트

**반환 예시:**
```typescript
[
  { seatGrade: "VIP", capacity: 60 },
  { seatGrade: "R", capacity: 60 },
  { seatGrade: "S", capacity: 40 },
  { seatGrade: "A", capacity: 40 }
]
```

#### restoreStaticSeatVenue
```typescript
function restoreStaticSeatVenue(
  jsonData: StaticSeatVenue,
  gradeInfo?: VenueSeatCapacityRequest[]
): Omit<StaticSeatVenue, "venueId">
```
BE JSON 데이터 → StaticSeatVenue 복원 (검증 포함)

#### convertForBEStorage
```typescript
function convertForBEStorage(staticSeatVenue: StaticSeatVenue)
```
StaticSeatVenue → BE 저장 형식 변환

**반환값:**
```typescript
{
  layoutJson: StaticSeatVenue;
  seatGrades: VenueSeatCapacityRequest[];
  summary: {
    totalSeats: number;
    availableSeats: number;
    disabledSeats: number;
    gradeCount: number;
  };
}
```

#### checkGradeInfoUpdates
```typescript
function checkGradeInfoUpdates(
  oldData: StaticSeatVenue,
  newData: StaticSeatVenue
)
```
배치도 수정 시 등급 정보 변경을 감지합니다.

### UI 데이터 변환 (`seatTransformer.ts`, `transformSeatInfo.ts`)

#### transformSeatGradeInfo
```typescript
function transformSeatGradeInfo(
  seatTypes: Partial<Record<SeatGrade, SeatType>>
): SeatGradeInfo[]
```
좌석 타입 → UI 표시용 등급 정보 배열

#### transformUserSelectedSeats
```typescript
function transformUserSelectedSeats(
  seatChartConfig: SeatChartConfig | null
): UserSelectedSeat[]
```
선택 좌석 → 사용자 표시용 배열 (등급/가격 포함, 가격 내림차순 정렬)

**반환 예시:**
```typescript
[
  { row: 0, col: 5, grade: "VIP", price: 150000 },
  { row: 1, col: 3, grade: "R", price: 120000 },
]
```

#### transformToGradeInfoArray
```typescript
function transformToGradeInfoArray(
  selectedSeatInfo: Partial<Record<SeatGrade, UserSelectedSeat[]>>
): GradeInfo[]
```
등급별 선택 좌석 → GradeInfo 배열 변환

## 상태 관리

### Zustand Store

#### useBookingStepStore
**파일:** `src/features/service/booking-seating-chart/model/booking-step.store.ts`

**역할:** 예매 프로세스 Step 관리

**상태:**
```typescript
{
  step: BookingStep;                      // 1 | 2 | 3
  bookingData: BookingResponse | null;    // 좌석 점유 응답 데이터
}
```

**액션:**
```typescript
{
  setStep: (step: BookingStep) => void;
  setBookingData: (data: BookingResponse | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}
```

## 데이터 흐름

### 관리자 좌석 배치도 생성 플로우

```
1. SeatingChartManager 렌더링
   ↓
2. useSeatingChart(venueId) - 기존 배치도 조회 (React Query)
   ↓
3. StaticSeatChart 렌더링 (initialData)
   ↓
4. 사용자가 배치도 편집
   - 행/열 수 설정
   - 좌석 타입 추가/삭제 (색상, positions)
   - 비활성화 좌석 설정
   - 간격 설정
   ↓
5. 실시간 미리보기 (SeatChart 컴포넌트)
   ↓
6. "배치도 저장" 클릭
   ↓
7. extractSeatGradeInfo() - 등급별 좌석 수 계산
   ↓
8. updateSeatingChart API 호출
   - seatingChart: StaticSeatVenue (JSON)
   - seatCapacities: VenueSeatCapacityRequest[]
   ↓
9. 성공 시 toast 알림 + 캐시 무효화
```

### 사용자 예매 좌석 선택 플로우

```
1. BookingSeatingChart 렌더링
   ↓
2. useBookingSeatSelection(venueId, scheduleId)
   - useSeatChart 호출 (React Query)
     - getSeatingChart(venueId)
     - getSchedule(scheduleId) - 가격 정보
   - SSE 연결 시작 (실시간 좌석 상태)
     - URL: getSubscribeSeatEventsUrl(scheduleId)
     - 이벤트: seat-update
   ↓
3. SeatChart 렌더링 (mode: "view")
   ↓
4. 사용자 좌석 클릭
   ↓
5. toggleSeatSelectionWithLimit()
   - 최대 4개 검증 (MAX_SEAT_SELECTION)
   - selectedSeats 업데이트
   ↓
6. SelectSeatInfo 업데이트
   - transformUserSelectedSeats() 변환
   - 가격순 정렬 표시
   ↓
7. "좌석 선택 완료" 클릭
   ↓
8. handleCompleteSelection()
   - startBooking API 호출 (좌석 점유)
   - bookingData 저장 (Zustand)
   - Step 2로 전환
   ↓
9. BookingDiscountSelectionForm 렌더링
   - SeatChart mode: "payment" (선택 불가)
   ↓
10. 할인 선택 후 결제 진행
```

### SSE 실시간 좌석 상태 업데이트

```
EventSource 연결
   ↓
seat-update 이벤트 수신
{
  action: "OCCUPIED" | "RELEASED" | "CONFIRMED",
  seats: [{ row: 1, col: 1 }, ...]  // 1-based index
}
   ↓
updateBookingStatus()
   ↓
bookingStatus 상태 업데이트
- OCCUPIED: pendingSeats 추가
- RELEASED: pendingSeats 제거
- CONFIRMED: reservedSeats 추가
   ↓
SeatChart 리렌더링 (좌석 색상 변경)
```

## API 연동

### 좌석 배치도 조회
**orval 함수:** `getSeatingChart(venueId: number)`

**응답 구조:**
```typescript
{
  venueId: number;
  seatingChart?: StaticSeatVenue;  // JSON 형태
  seatCapacities?: VenueSeatCapacityResponse[];
}
```

### 좌석 배치도 저장/수정
**orval 함수:** `updateSeatingChart(venueId: number, request: SeatingChartRequest)`

**요청 구조:**
```typescript
{
  seatingChart: StaticSeatVenue;
  seatCapacities: VenueSeatCapacityRequest[];
}
```

### 회차 정보 조회 (가격 포함)
**orval 함수:** `getSchedule(scheduleId: number)`

**응답 구조:**
```typescript
{
  id: number;
  showDateTime: string;
  ticketOptions: {
    seatGrade: string;
    price: number;
    remainingSeats: number;
  }[];
}
```

**사용:**
```typescript
scheduleData.ticketOptions.find(option => option.seatGrade === type)?.price
```

### 좌석 상태 조회
**orval 함수:** `getSeatStatus(scheduleId: number)`

**응답 구조:**
```typescript
{
  reservedSeats: SeatPosition[];
  pendingSeats: SeatPosition[];
}
```

### 좌석 점유 (예매 시작)
**orval 함수:** `startBooking(request: StartBookingRequest)`

**요청 구조:**
```typescript
{
  scheduleId: number;
  seats: { row: number; col: number }[];  // 1-based index
}
```

**응답 구조:**
```typescript
{
  bookingId: string;
  bookingNumber: string;
  expiresAt: string;
  remainingSeconds: number;
  seats: BookingSeatResponse[];
  totalPrice: number;
  status: "PENDING";
}
```

### 좌석 점유 해제 (예매 취소)
**orval 함수:** `cancelBooking(bookingId: string)`

### SSE 실시간 구독
**orval 함수:** `getSubscribeSeatEventsUrl(scheduleId: number): string`

**이벤트 형식:**
```typescript
// event: seat-update
{
  action: "OCCUPIED" | "RELEASED" | "CONFIRMED";
  seats: { row: number; col: number }[];  // 1-based index
}
```

**이벤트 타입:**
- `connect`: 연결 성공
- `seat-update`: 좌석 상태 변경
- `heartbeat`: 연결 유지 (45초마다)

## 사용 예시

### 관리자 페이지

```typescript
// app/admin/(auth)/venues/seating-chart/create/page.tsx
import { SeatingChartView } from "@/views/admin/seating-chart/SeatingChartView";

export default function SeatingChartCreatePage() {
  return <SeatingChartView />;
}
```

### 사용자 예매 페이지

```typescript
// app/(layout)/booking/seating-chart/page.tsx
import { BookingSeatingChartView } from "@/views/service/booking-seating-chart/BookingSeatingChartView";

export default function BookingSeatingChartPage() {
  return <BookingSeatingChartView />;
}
```

### 기본 좌석 차트 렌더링

```typescript
import { SeatChart } from '@/shared/lib/seat';
import type { SeatChartConfig } from '@/shared/lib/seat';

const seatConfig: SeatChartConfig = {
  rows: 10,
  columns: 20,
  mode: "view",
  seatTypes: {
    VIP: {
      price: 150000,
      positions: ["1:", "2:", "3:"]
    },
    R: {
      price: 120000,
      positions: ["4:", "5:", "6:"]
    },
    S: {
      price: 90000,
      positions: ["7:", "8:"]
    },
    A: {
      price: 70000,
      positions: ["9:", "10:"]
    }
  },
  disabledSeats: [{ row: 0, col: 0 }, { row: 0, col: 19 }],
  reservedSeats: [{ row: 1, col: 5 }],
  pendingSeats: [{ row: 1, col: 6 }],
  selectedSeats: [],
  rowSpacers: [5],      // 5행 뒤에 간격
  columnSpacers: [10]   // 10열 뒤에 간격 (통로)
};

function SeatPage() {
  const handleSeatClick = (row: number, col: number) => {
    console.log(`좌석 클릭: ${row}행 ${col}열 (0-based)`);
  };

  return (
    <SeatChart
      config={seatConfig}
      onSeatClick={handleSeatClick}
    />
  );
}
```

### 실시간 예매 시스템 (React Query)

```typescript
"use client";

import { useSeatChart } from '@/shared/lib/seat';
import { SeatChart } from '@/shared/lib/seat';

interface BookingSeatViewProps {
  venueId: number;
  scheduleId?: number;  // 회차 ID (옵셔널, 가격 정보 필요 시 제공)
}

function BookingSeatView({ venueId, scheduleId }: BookingSeatViewProps) {
  const {
    seatChartConfig,
    toggleSeatSelection,
    userSelection,
    isLoading,
    error
  } = useSeatChart(venueId, scheduleId);

  if (isLoading) {
    return <div>좌석 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div>에러: {error}</div>;
  }

  if (!seatChartConfig) {
    return <div>좌석 정보를 찾을 수 없습니다.</div>;
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

**주요 특징:**
- React Query를 사용한 자동 데이터 패칭 및 캐싱
- `venueId`로 좌석 배치도 자동 조회
- `scheduleId`로 가격 정보 자동 조회 (옵셔널)
- 로딩 상태 및 에러 핸들링 내장

## 성능 최적화

### React Query 최적화
- 자동 캐싱으로 동일한 `venueId`/`scheduleId` 재사용 시 네트워크 요청 방지
- `enabled` 옵션으로 필요한 경우에만 쿼리 실행
- Stale-while-revalidate 전략으로 즉시 UI 렌더링 후 백그라운드 업데이트
- 쿼리 키 기반 캐시 무효화 (`queryKey: ["seatingChart", venueId]`)
- 좌석 배치도와 회차 정보를 병렬로 조회 (자동 병렬 처리)

### React 최적화
- `useState`와 `useCallback`을 활용한 리렌더링 최소화
- 좌석 클릭 시 컴포넌트 전체 재렌더링 방지
- 터치 이벤트와 마우스 이벤트 중복 처리 방지
- `useEffect` 의존성 최적화로 불필요한 재실행 방지

### 데이터 로딩 최적화
- `scheduleId`가 없는 경우 회차 쿼리 비활성화 (`enabled: !!scheduleId`)
- 에러 핸들링 내장으로 안정성 향상
- SSE 연결 자동 재연결 및 cleanup

### 메모리 최적화
- 대용량 좌석 배치도 처리 시 가상화 고려
- 불필요한 좌석 상태 계산 최소화
- 이벤트 핸들러 메모리 리크 방지
- React Query 자동 가비지 컬렉션 (staleTime 이후 자동 삭제)
- SSE EventSource cleanup (useEffect return)

## 주요 상수

### PRESET_COLORS
**파일:** `src/shared/lib/seat/constants/seatChart.constants.ts`

```typescript
[
  { name: "레드", value: "#E53935" },
  { name: "블루", value: "#1E88E5" },
  { name: "그린", value: "#43A047" },
  { name: "오렌지", value: "#FB8C00" },
  { name: "퍼플", value: "#8E24AA" },
  { name: "옐로우", value: "#FDD835" },
  { name: "시안", value: "#00ACC1" },
  { name: "브라운", value: "#6D4C41" },
  { name: "핑크", value: "#D81B60" },
]
```

### MAX_SEAT_SELECTION
```typescript
export const MAX_SEAT_SELECTION = 4 as const;
```

## 핵심 기능 정리

### 좌석 등급 결정 알고리즘
1. 구체적 위치 매칭 (`"3:5"`)
2. 행 전체 매칭 (`"3:"`)
3. 열 전체 매칭 (`":5"`)
4. 기본값 (마지막 등급)

### 좌석 선택 제한
- 최대 4개 (MAX_SEAT_SELECTION)
- 이미 점유/예약된 좌석 선택 불가
- payment 모드에서 선택 불가

### 실시간 상태 동기화 (SSE)
- EventSource를 통한 SSE 연결
- `seat-update` 이벤트 수신
- OCCUPIED: pendingSeats 추가
- RELEASED: pendingSeats 제거
- CONFIRMED: reservedSeats 추가
- 자동 재연결 처리
- useEffect cleanup으로 연결 종료

### 좌석 배치도 저장 전략
- JSON 형태로 전체 배치도 저장 (StaticSeatVenue)
- 등급별 정보는 별도 계산 (extractSeatGradeInfo)
- BE에 두 데이터 모두 전송
- 캐시 무효화로 즉시 반영

## 인덱스 방식

### 0-based vs 1-based
- **좌석 위치 (SeatPosition)**: 0-based index
  - `{ row: 0, col: 0 }` = 1행 1열
- **좌석 타입 positions**: 1-based string
  - `"1:"` = 1행 전체 (index 0)
- **SSE 이벤트**: 1-based index
  - 서버 → 클라이언트 시 -1 변환 필요
- **API 요청/응답**: 1-based index
  - 클라이언트 → 서버 시 +1 변환
  - 서버 → 클라이언트 시 -1 변환
