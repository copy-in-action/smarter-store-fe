# MSW (Mock Service Worker) 설정 가이드

## 개요

MSW는 Service Worker를 사용하여 네트워크 레벨에서 API 요청을 가로채고 모킹할 수 있는 라이브러리입니다. 백엔드 API가 준비되지 않았거나 에러가 발생할 때 프론트엔드 개발을 계속 진행할 수 있도록 도와줍니다.

## 설치된 패키지

```bash
pnpm add -D msw@2.12.7
```

## 프로젝트 구조

```
src/
├── shared/
│   └── api/
│       └── mocks/
│           ├── data/
│           │   ├── performances.ts              # 공연 정보 목 데이터
│           │   ├── performance-schedules.ts     # 공연 회차 목 데이터
│           │   └── seating-charts.ts            # 좌석 배치도 목 데이터
│           ├── handlers/
│           │   ├── performance.handlers.ts      # 공연 정보 핸들러
│           │   ├── performance-schedule.handlers.ts  # 공연 회차 핸들러
│           │   ├── schedule.handlers.ts         # 회차 정보 핸들러
│           │   ├── venue.handlers.ts            # 공연장 핸들러
│           │   ├── booking.handlers.ts          # 예매 핸들러
│           │   └── index.ts                     # 핸들러 통합
│           └── browser.ts                       # 브라우저용 MSW worker
└── app/
    └── providers/
        └── MSWProvider.tsx                      # MSW Provider 컴포넌트

public/
└── mockServiceWorker.js                         # Service Worker 스크립트
```

## 설정 방법

### 1. Service Worker 초기화

```bash
npx msw init public/ --save
```

이 명령어는 `public/mockServiceWorker.js` 파일을 생성하고 `package.json`에 `msw.workerDirectory` 설정을 추가합니다.

### 2. 목 데이터 정의

`src/shared/api/mocks/data/performance-schedules.ts`:

```typescript
import { addDays, formatISO } from "date-fns";
import type { PerformanceScheduleResponse } from "../../orval/types";

const now = new Date();
const threeDaysLater = addDays(now, 3);
const fourDaysLater = addDays(now, 4);

export const mockPerformanceSchedules: Map<
  number,
  PerformanceScheduleResponse[]
> = new Map([
  [
    1,
    [
      {
        id: 1,
        showDateTime: formatISO(new Date(threeDaysLater.getFullYear(), ...)),
        saleStartDateTime: formatISO(now),
        ticketOptions: [
          { id: 1, seatGrade: "VIP", price: 150000 },
          // ...
        ],
      },
      // ...
    ],
  ],
]);
```

**특징:**
- `date-fns`를 사용하여 동적으로 시간 생성
- 현재 시간 기준으로 3일 뒤, 4일 뒤 공연 회차 생성
- Map 구조로 `performanceId`별 회차 관리

### 3. API 핸들러 작성

`src/shared/api/mocks/handlers/performance-schedule.handlers.ts`:

```typescript
import { http, HttpResponse } from "msw";

const BASE_URL = "https://ticket-api.devhong.cc/api/performances";

export const getSchedulesHandler = http.get(
  `${BASE_URL}/:id/schedules`,
  ({ params }) => {
    const performanceId = Number(params.id);
    const schedules = mockPerformanceSchedules.get(performanceId) || [];

    return HttpResponse.json({
      data: schedules,
      status: 200,
    });
  }
);

export const createScheduleHandler = http.post(
  `${BASE_URL}/:id/schedules`,
  async ({ params, request }) => {
    const performanceId = Number(params.id);
    const body = await request.json();
    // ... 생성 로직
    return HttpResponse.json({ data: newSchedule, status: 200 });
  }
);

// ... 기타 핸들러 (조회, 수정, 삭제)
```

### 4. 핸들러 통합

`src/shared/api/mocks/handlers/index.ts`:

```typescript
import { performanceScheduleHandlers } from "./performance-schedule.handlers";

export const handlers = [...performanceScheduleHandlers];
```

### 5. 브라우저 Worker 설정

`src/shared/api/mocks/browser.ts`:

```typescript
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

### 6. MSW Provider 생성

`src/app/providers/MSWProvider.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(
    () => process.env.NODE_ENV !== "development",
  );

  useEffect(() => {
    async function initMsw() {
      if (process.env.NODE_ENV === "development") {
        const { worker } = await import("@/shared/api/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
        });
        setMswReady(true);
      }
    }

    initMsw();
  }, []);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}
```

**주요 특징:**
- 개발 환경에서만 MSW 활성화
- Service Worker가 준비될 때까지 렌더링 지연
- `onUnhandledRequest: "bypass"`로 모킹되지 않은 요청은 실제 서버로 전달

### 7. 루트 레이아웃에 통합

`app/layout.tsx`:

```typescript
import { MSWProvider, QueryProvider, AuthProvider } from "@/app/providers";

export default async function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <MSWProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
```

## 모킹된 API 목록

현재 활성화된 MSW 핸들러 목록입니다. 필요에 따라 `handlers/index.ts`에서 선택적으로 활성화/비활성화할 수 있습니다.

### 공연 정보 API

`performance.handlers.ts`

| Method | Endpoint | Handler | 설명 |
|--------|----------|---------|------|
| GET | `/api/performances/:id` | `getPerformanceHandler` | 공연 상세 정보 조회 |

### 공연 회차 관리 API

`performance-schedule.handlers.ts`

| Method | Endpoint | Handler | 설명 | 활성화 |
|--------|----------|---------|------|:------:|
| GET | `/api/performances/:id/schedules` | `getSchedulesHandler` | 특정 공연의 예매 가능한 회차 조회 (잔여석 포함) | ✅ |
| GET | `/api/performances/:id/schedules/dates` | `getScheduleDatesHandler` | 예매 가능한 회차 날짜 목록 조회 | ✅ |
| POST | `/api/performances/:id/schedules` | `createScheduleHandler` | 공연 회차 생성 | ❌ |
| GET | `/api/performances/schedules/:scheduleId` | `getScheduleHandler` | 단일 회차 조회 | ❌ |
| PUT | `/api/performances/schedules/:scheduleId` | `updateScheduleHandler` | 회차 수정 | ❌ |
| DELETE | `/api/performances/schedules/:scheduleId` | `deleteScheduleHandler` | 회차 삭제 | ❌ |

**Note**: 생성/수정/삭제 핸들러는 현재 비활성화 상태입니다. 필요 시 `handlers/index.ts`에 추가하세요.

### 회차 정보 API

`schedule.handlers.ts`

| Method | Endpoint | Handler | 설명 |
|--------|----------|---------|------|
| GET | `/api/schedules/:id` | `getScheduleHandler` | 단일 회차 정보 조회 (가격 정보 포함) |

### 공연장 API

`venue.handlers.ts`

| Method | Endpoint | Handler | 설명 |
|--------|----------|---------|------|
| GET | `/api/venues/:id/seating-chart` | `getSeatingChartHandler` | 공연장 좌석 배치도 조회 |

### 예매 API

`booking.handlers.ts`

| Method | Endpoint | Handler | 설명 |
|--------|----------|---------|------|
| POST | `/api/bookings/start` | `startBookingHandler` | 예매 시작 (좌석 점유) |
| DELETE | `/api/bookings/:id` | `cancelBookingHandler` | 예매 취소 (좌석 점유 해제) |

## 목 데이터 상세

### 공연 정보 (performanceId: 4)

`src/shared/api/mocks/data/performances.ts`

- **공연 ID**: 4
- **공연명**: 뮤지컬 오페라의 유령
- **설명**: 전 세계를 감동시킨 앤드류 로이드 웨버의 불멸의 명작. 파리 오페라 하우스를 배경으로 펼쳐지는 환상적인 사랑 이야기
- **카테고리**: 뮤지컬
- **공연장**: 샬롯데씨어터 (venueId: 1)
- **공연 기간**: 2026-01-06 ~ 2026-03-31
- **관람 연령**: 8세 이상
- **러닝타임**: 150분
- **출연진**: 홍광호, 김소현, 최재림, 신영숙
- **기획사/제작사**: EMK뮤지컬컴퍼니
- **예매 수수료**: 1,000원
- **할인 정보**: 조기예매 할인 20%, 학생 할인 15%, 단체 할인(10인 이상) 10%
- **환불 규정**:
  - 관람일 기준 10일 전까지 전액 환불
  - 관람일 기준 9~7일 전까지 90% 환불
  - 관람일 기준 6~3일 전까지 80% 환불
  - 관람일 기준 2일~1일 전까지 70% 환불
  - 관람 당일 환불 불가

### 공연 회차 (performanceId: 4)

`src/shared/api/mocks/data/performance-schedules.ts`

**3일 뒤 회차 (3개)**
- 14:00 (scheduleId: 1)
- 15:00 (scheduleId: 2)
- 16:00 (scheduleId: 3)

**4일 뒤 회차 (2개)**
- 14:00 (scheduleId: 4)
- 15:00 (scheduleId: 5)

**티켓 옵션 (각 회차 공통)**
- VIP석: 150,000원 (잔여석: 10석)
- R석: 120,000원 (잔여석: 10석)
- S석: 90,000원 (잔여석: 10석)
- A석: 70,000원 (잔여석: 10석)

### 좌석 배치도 (venueId: 2)

`src/shared/api/mocks/data/seating-charts.ts`

**데이터 구조** (`SeatingChartResponse`)
```typescript
{
  venueId: number;                    // 공연장 ID (필수)
  seatingChart?: {                    // 좌석 배치도 JSON
    rows: number;                     // 총 행 수
    columns: number;                  // 총 열 수
    seatTypes: Partial<Record<SeatGrade, SeatType>>;
    disabledSeats: SeatPosition[];    // 비활성 좌석 목록
    rowSpacers: number[];             // 행 간격 위치
    columnSpacers: number[];          // 열 간격 위치
  };
  seatCapacities?: VenueSeatCapacityResponse[];  // 등급별 좌석 수
}
```

**SeatType 구조**
```typescript
{
  price?: number;           // 좌석 가격
  positions: string[];      // 좌석 위치 배열
}
```

**좌석 위치 표기법** (`positions` 배열)
- `"1:"`: 1행 전체 (모든 열)
- `":5"`: 5열 전체 (모든 행)
- `"3:5"`: 3행 5열 특정 좌석
- 1-indexed (1부터 시작)

**구조**: 10행 × 20열 (총 200석)

**등급별 구역 및 가격**
- VIP석: 1-3행 (150,000원) - 60석
- R석: 4-6행 (120,000원) - 60석
- S석: 7-8행 (90,000원) - 40석
- A석: 9-10행 (70,000원) - 40석

**레이아웃 특징**
- 통로: 10열 뒤 (columnSpacers: [10])
- 비활성 좌석: 없음 (disabledSeats: [])

### 예매 정보

`src/shared/api/mocks/handlers/booking.handlers.ts`

**좌석 점유 (POST /api/bookings/start)**
- 최대 선택: 4석
- 점유 시간: 5분 (300초)
- 점유 시 상태: PENDING
- 점유 해제 시 상태: CANCELLED

**예매 ID 생성 규칙**
- bookingId: `booking_${counter}` (메모리 카운터)
- bookingNumber: `BK${timestamp 마지막 8자리}`

**좌석 등급 자동 계산**
- 1~3행: VIP석
- 4~6행: R석
- 7~8행: S석
- 9~10행: A석

**예매 응답 데이터 (`BookingResponse`)**
```typescript
{
  bookingId: string,          // 예매 ID (내부 참조용)
  bookingNumber: string,      // 예매 번호 (사용자 표시용)
  expiresAt: string,          // 만료 시각 (ISO 8601)
  remainingSeconds: number,   // 남은 시간 (초) - 300
  seats: [                    // 예매 좌석 목록
    {
      id: number,             // 좌석 ID
      section: "1층",         // 좌석 구역
      rowName: "3열",         // 좌석 열
      seatNumber: 15,         // 좌석 번호
      grade: "VIP",           // 좌석 등급
      price: 150000           // 좌석 가격
    }
  ],
  totalPrice: number,         // 총 결제 금액
  status: "PENDING"           // 예매 상태
}
```

## 사용 방법

### 개발 서버 실행

```bash
pnpm dev
```

브라우저 콘솔에서 다음 메시지 확인:

```
[MSW] Mocking enabled.
```

### 특정 API만 모킹하기

특정 API만 선택적으로 모킹하려면 `handlers/index.ts`를 수정하세요:

```typescript
// src/shared/api/mocks/handlers/index.ts
import { bookingHandlers } from "./booking.handlers";
import { getPerformanceHandler } from "./performance.handlers";
import {
  getScheduleDatesHandler,
  getSchedulesHandler,
} from "./performance-schedule.handlers";
import { scheduleHandlers } from "./schedule.handlers";
import { venueHandlers } from "./venue.handlers";

export const handlers = [
  getPerformanceHandler,        // 공연 상세 정보 조회
  getSchedulesHandler,          // 회차 목록 조회
  getScheduleDatesHandler,      // 예매 가능한 날짜 목록 조회
  ...scheduleHandlers,          // 회차 정보 조회
  ...venueHandlers,             // 좌석 배치도 조회
  ...bookingHandlers,           // 예매 시작/취소
  // createScheduleHandler,     // 주석 처리하면 실제 API 호출
];
```

**현재 활성화된 핸들러:**

**[공연 정보] (`performance.handlers.ts`)**
- `getPerformanceHandler`: GET /api/performances/:id

**[공연 회차] (`performance-schedule.handlers.ts`)**
- `getSchedulesHandler`: GET /api/performances/:id/schedules
- `getScheduleDatesHandler`: GET /api/performances/:id/schedules/dates

**[회차 정보] (`schedule.handlers.ts`)**
- `getScheduleHandler`: GET /api/schedules/:id

**[공연장] (`venue.handlers.ts`)**
- `getSeatingChartHandler`: GET /api/venues/:id/seating-chart

**[예매] (`booking.handlers.ts`)**
- `startBookingHandler`: POST /api/bookings/start
- `cancelBookingHandler`: DELETE /api/bookings/:id

### MSW 완전 비활성화

MSW를 완전히 비활성화하려면 `app/layout.tsx`에서 MSWProvider를 제거하세요:

```typescript
// app/layout.tsx
<body>
  {/* <MSWProvider> 제거 */}
  <QueryProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryProvider>
  {/* </MSWProvider> 제거 */}
</body>
```

## 새로운 핸들러 추가하기

### 1. 목 데이터 작성

`src/shared/api/mocks/data/your-data.ts`:

```typescript
import type { YourResponse } from "../../orval/types";

export const mockYourData: Map<number, YourResponse> = new Map([
  [1, { id: 1, name: "Sample Data" }],
]);
```

### 2. 핸들러 작성

`src/shared/api/mocks/handlers/your.handlers.ts`:

```typescript
import { type HttpHandler, HttpResponse, http } from "msw";
import { mockYourData } from "../data/your-data";

/**
 * 데이터 조회 핸들러
 * GET /api/your-endpoint/:id
 */
export const getYourDataHandler = http.get(
  "/api/your-endpoint/:id",
  ({ params }) => {
    const id = Number(params.id);
    const data = mockYourData.get(id);

    if (!data) {
      return HttpResponse.json(
        { message: "데이터를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return HttpResponse.json(data);
  },
);

/**
 * 관련 모든 MSW 핸들러
 */
export const yourHandlers: HttpHandler[] = [getYourDataHandler];
```

### 3. 핸들러 통합

`src/shared/api/mocks/handlers/index.ts`:

```typescript
import { bookingHandlers } from "./booking.handlers";
import { getPerformanceHandler } from "./performance.handlers";
import {
  getScheduleDatesHandler,
  getSchedulesHandler,
} from "./performance-schedule.handlers";
import { scheduleHandlers } from "./schedule.handlers";
import { venueHandlers } from "./venue.handlers";
import { yourHandlers } from "./your.handlers";  // ⭐ 추가

export const handlers = [
  getPerformanceHandler,
  getSchedulesHandler,
  getScheduleDatesHandler,
  ...scheduleHandlers,
  ...venueHandlers,
  ...bookingHandlers,
  ...yourHandlers,  // ⭐ 추가
];
```

## 주의사항

### 1. Service Worker 캐싱
브라우저의 Service Worker 캐시로 인해 변경사항이 즉시 반영되지 않을 수 있습니다.
- 개발자 도구 > Application > Service Workers에서 "Unregister" 후 새로고침
- 또는 하드 새로고침 (Cmd/Ctrl + Shift + R)

### 2. 프로덕션 빌드
MSW는 개발 환경에서만 동작하도록 설정되어 있습니다. 프로덕션 빌드 시 자동으로 제외됩니다.

### 3. TypeScript 타입 안정성
Orval로 생성된 타입을 사용하여 목 데이터와 핸들러의 타입 안정성을 보장합니다.

## 참고 자료

- [MSW 공식 문서](https://mswjs.io/docs/getting-started)
- [MSW 2.0 소개](https://mswjs.io/blog/introducing-msw-2.0)
- [Next.js에서 MSW 사용하기](https://mswjs.io/docs/integrations/browser)
