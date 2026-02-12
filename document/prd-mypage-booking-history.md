# PRD: 마이페이지 - 예매 내역 관리

## 1. 개요

### 1.1 목적
사용자가 자신의 공연 예매 내역을 조회, 검색, 필터링하고 예매를 취소할 수 있는 기능을 제공합니다.

### 1.2 범위
- 마이페이지 UI 및 예매 내역 링크 설정
- 예매 내역 리스트 조회 (Data Table)
- 예매 상세 정보 조회
- 예매 취소 기능
- 검색 및 필터링 기능

---

## 2. 일반적인 공연예매 사이트 마이페이지 기능 목록

### 2.1 예매 관리
- ✅ **예매 내역 조회** (본 PRD 범위)
- ✅ **예매 상세 정보** (본 PRD 범위)
- ✅ **예매 취소** (본 PRD 범위)
- 예매 확인/인증서 출력
- 티켓 수령 방법 변경

### 2.2 회원 정보
- 회원정보 수정
- 비밀번호 변경
- 알림 설정
- 회원 탈퇴

### 2.3 관심/찜
- 관심 공연 목록
- 알림 신청 공연
- 최근 본 공연

---

## 3. 기능 요구사항

### 3.1 예매 내역 리스트 페이지

#### 3.1.1 기본 정보
- **경로**: `/mypage/bookings`
- **API**: `GET /api/bookings/me`
- **컴포넌트**: Data Table 사용

#### 3.1.2 표시 필드
| 필드명 | 설명 | 타입 |
|--------|------|------|
| bookingNumber | 예매 번호 (클릭 가능) | string |
| performanceTitle | 공연명 | string |
| showDateTime | 공연 일시 | string (ISO 8601) |
| status | 예매 상태 | enum |
| totalPrice | 총 결제 금액 | number |
| ticketCount | 매수 | number |

#### 3.1.3 검색 기능
- **검색 필드**:
  - performanceTitle (공연명)
  - bookingNumber (예매 번호)
- **검색 방식**: Client-side Global Filter (실시간 검색)

#### 3.1.4 필터 기능
1. **공연 일시 필터**
   - 캘린더 컴포넌트 (DateRangePicker) 사용
   - 날짜 범위 선택 가능
   - Client-side filtering 적용

2. **예매 상태 필터**
   - 체크박스 다중 선택
   - 필드: `status`
   - 상태값:
     - 예매 확정 (CONFIRMED)
     - 결제 대기 (PENDING)
     - 취소됨 (CANCELLED)
     - 만료됨 (EXPIRED)

#### 3.1.5 정렬 기능
- Data Table 컬럼별 정렬 지원
- Client-side sorting

#### 3.1.6 페이지네이션
- Data Table Client-side Pagination 사용

---

### 3.2 예매 상세 페이지

#### 3.2.1 기본 정보
- **경로**: `/mypage/bookings/[bookingId]`
- **API**: `GET /api/bookings/{bookingId}`
- **진입**: 리스트에서 예매 번호 또는 상세보기 클릭

#### 3.2.2 화면 구성
1. **상단 액션 바**
   - 목록 버튼 (목록으로 돌아가기)
   - 예매 취소 버튼 (상태에 따라 활성화)

2. **예매 정보 표시**
   - **기본 정보**: 공연명, 예매번호, 상태, 공연 일시, 예매 일시
   - **결제 정보**: `BookingPaymentInfo` 컴포넌트 사용

#### 3.2.3 데이터 구조
```typescript
{
  bookingId: number;
  bookingNumber: string;
  performanceTitle: string;
  showDateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  totalPrice: number;
  createdAt: string;
  // 결제 정보 포함
}
```

---

### 3.3 예매 취소 기능

#### 3.3.1 기본 정보
- **API**: `DELETE /api/bookings/{bookingId}` (또는 `POST /api/bookings/{bookingId}/cancel`)
- **위치**: 예매 상세 페이지 상단 액션 바

#### 3.3.2 취소 프로세스
1. 사용자가 "예매 취소" 버튼 클릭
2. **확인 다이얼로그 (AlertDialog) 표시**:
   ```
   제목: 예매를 취소하시겠습니까?
   내용:
   - 예매번호: {bookingNumber}
   - 공연명: {performanceTitle}
   - 취소 시 환불 정책에 따라 처리됩니다.

   버튼: [취소] [확인]
   ```
3. 사용자가 "확인" 클릭 시:
   - API 호출
   - 성공 시: 토스트 메시지 표시 후 리스트 페이지로 이동
   - 실패 시: 에러 메시지 표시 (Toast)

#### 3.3.3 취소 가능 조건
- `status`가 "CONFIRMED" 또는 "PENDING"인 경우만 가능
- 공연 시작 시간 이전인 경우만 가능

#### 3.3.4 에러 처리
- Toast 알림을 통해 에러 메시지 표시

---

## 4. 기술 스택 및 아키텍처

### 4.1 FSD 구조
```
src/
├── views/
│   └── service/
│       └── mypage/
│           ├── MyBookingsListView.tsx      # 예매 내역 리스트 페이지 뷰
│           ├── MyBookingDetailView.tsx     # 예매 상세 페이지 뷰
│           ├── MyPageView.tsx              # 마이페이지 메인 뷰
│           └── index.ts
│
├── features/
│   └── service/
│       ├── booking-list/                   # 예매 리스트 기능
│       │   ├── ui/
│       │   │   ├── BookingListContainer.tsx # 컨테이너 (데이터 페칭)
│       │   │   ├── BookingDataTable.tsx     # Data Table & Filter Logic
│       │   │   ├── BookingColumns.tsx       # 컬럼 정의
│       │   │   └── BookingFilter.tsx        # 필터 UI
│       │   └── index.ts
│       │
│       └── booking-detail/                 # 예매 상세 기능
│           ├── ui/
│           │   ├── BookingDetailView.tsx    # 상세 뷰 로직
│           │   └── BookingPaymentInfo.tsx   # 결제 정보 컴포넌트
│           └── index.ts
│
└── entities/
    └── booking/                            # 예매 도메인
        ├── ui/
        │   └── BookingStatusBadge.tsx
        ├── api/
        │   ├── booking.api.ts              # API Wrapper
        │   └── booking.queries.ts          # React Query Hooks
        ├── model/
        │   └── booking.types.ts            # 타입 정의
        └── index.ts
```

### 4.2 사용 라이브러리
- **UI 컴포넌트**: Shadcn UI (Table, Button, Input, DropdownMenu, AlertDialog, Badge 등)
- **데이터 페칭**: React Query (TanStack Query)
- **테이블 관리**: TanStack Table (useReactTable)
- **날짜 처리**: DateRangePicker (DayPicker)
- **알림**: Sonner (Toast)

---

## 5. API 명세 (Client Implementation 기준)

### 5.1 예매 내역 조회
```
GET /api/bookings/me

Response:
Array<{
  bookingId: number;
  bookingNumber: string;
  performanceTitle: string;
  showDateTime: string;
  status: BookingStatus;
  totalPrice: number;
  ticketCount: number;
  createdAt: string;
}>
```
*현재 구현은 전체 리스트를 가져와서 Client-side에서 필터링/페이지네이션 처리함.*

### 5.2 예매 상세 조회
```
GET /api/bookings/{bookingId}
```

### 5.3 예매 취소
```
DELETE /api/bookings/{bookingId}
```

---

## 6. 개발 우선순위 및 현황 (Status)

### Phase 1: 기본 기능 (완료)
- ✅ 예매 내역 리스트 페이지 (BookingDataTable)
- ✅ 예매 상세 페이지 (BookingDetailView)
- ✅ 예매 취소 기능 (AlertDialog 연동)

### Phase 2: 검색/필터 (완료)
- ✅ Client-side Global Filter (공연명, 예매번호)
- ✅ Client-side Date Range Filter
- ✅ Client-side Status Filter (Multi-select)

### Phase 3: UX 개선
- ✅ 반응형 디자인 (Table Scroll, Flex Layout)
- ✅ 로딩/에러 상태 처리 (Skeleton, Error Message)
- [ ] 서버 사이드 필터링/페이지네이션 전환 (데이터 양 증가 시 필요)

---

## 7. 테스트 시나리오

### 7.1 기능 테스트
- ✅ 예매 내역 리스트 정상 표시
- ✅ 검색 기능 동작 확인 (공연명, 예매번호)
- ✅ 날짜 범위 필터 동작 확인
- ✅ 상태 필터 동작 확인 (다중 선택)
- ✅ 상세 페이지 진입 및 정보 확인
- ✅ 예매 취소 프로세스 (Dialog -> Confirm -> Toast -> Redirect)

### 7.2 엣지 케이스
- ✅ 데이터가 없을 때 "예매 내역이 없습니다" 표시
- ✅ 로딩 중 스피너/스켈레톤 표시
- [ ] 에러 발생 시 UI 처리