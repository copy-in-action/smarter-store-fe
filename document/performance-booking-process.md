# 공연예매 프로세스 설계 문서

## 1. 개요

### 1.1 예매 프로세스 플로우
```
공연 선택 → 회차 선택 → 좌석 선택 → 선택된 좌석등급별 결제방법 선택 -> 결제
```

---

## 2. 단계별 상세 프로세스
- 좌석선택까지는 구현이 완료된 상태.
- 구현 필요 플로우 기능 및 화면 설명

### 2.1 선택된 좌석등급별 할인방법 선택

#### 화면 구성
**좌측 섹션: 좌석 배치도 (View 모드)**
- `좌석 선택`의 왼쪽 섹션 (좌석배치도) 부분 좌석선택이 불가능해야하며 선택된 좌석들이 표시되어야 한다.

**우측 섹션: 할인방법 선택**
- `< 뒤로` 버튼 클릭 시 이전(`좌석 선택`)화면으로 이동
  - `좌석 선택`의 좌석 배치도 부분이 다시 선택 가능 모드로 변경되어야 함
- 비싼 가격부터 정렬되어야하며 Accordion으로 각 등급을 클릭하면 할인방법 선택 리스트가 접혀야함.
- 할인방법은 선택한 해당 좌석등급의 수만큼 여러 할인방법에서 +/- 버튼을 눌러서 총 수를 같게 해야함.
  - 할인방법 - List Item으로 표시하며 타이틀 - 할인명, 설명 - 가격, 액션 - 마이너스 버튼 | 수량 | 플러스 버튼 형태로 리스트 구성
- 총 결제 금액 표시
- 선택한 좌석만큼 할인방법을 선택했으면 예매하기 버튼 활성화
  - 예매하기 시 예매 시작 API 호출(`/api/bookings/start`)

#### 좌석 차트 모드
좌석 배치도 라이브러리에 다음 모드 추가 필요:
```typescript
// src/shared/lib/seat/types/seatLayout.types.ts
export type SeatChartMode = "edit" | "view" | "payment";
```
- `edit`: 좌석 설정 모드 (관리자)
- `view`: 좌석 선택 모드 (사용자)
- `payment`: 결제 준비 모드 (선택 불가, 보기만)

#### 상태 관리
```typescript
/**
 * 할인 선택 상태
 */
interface DiscountSelectionState {
  /** 좌석 등급별 할인 선택 */
  [gradeType: string]: {
    /** 해당 등급 총 좌석 수 */
    totalSeats: number;
    /** 선택된 할인방법 (discountMethodId -> 수량) */
    selectedDiscounts: Map<number, number>;
  };
}
```

#### 검증 로직
- 각 좌석 등급별로 선택한 할인방법 수량 합계 === 해당 등급 좌석 수
- 모든 좌석 등급의 할인방법 선택 완료 시에만 예매하기 버튼 활성화

#### API
- `POST /api/bookings/start`
  - Request Body:
    ```typescript
    {
      scheduleId: number;
      seatSelections: {
        seatId: number;
        discountMethodId: number;
      }[];
    }
    ```
  - Response:
    ```typescript
    {
      bookingId: number;
      expiresAt: string; // ISO 8601 (예: "2024-01-01T12:00:00Z")
    }
    ```

#### 에러 처리
- 할인방법 수량 불일치
  - "선택한 좌석 수와 할인방법 수량이 일치하지 않습니다"
- API 호출 실패
  - "예매를 시작할 수 없습니다. 다시 시도해주세요"
- 좌석 선점 실패 (다른 사용자가 먼저 선택)
  - "선택한 좌석이 이미 예약되었습니다. 다시 선택해주세요"

---


### 2.2 결제

#### 화면 구성
**상단: 타이머**
- `POST /api/bookings/start` 응답 데이터의 `expiresAt`를 기준으로 결제 가능 시간 카운트다운
- 타이머 만료 시 처리:
  - 예매 자동 취소
  - 좌석 선택 화면으로 리다이렉트
  - 안내 메시지: "예매 시간이 만료되었습니다. 다시 시도해주세요"

**좌측 섹션: 티켓 주문 상세정보**
- 공연 정보
  - 공연 이름
  - 관람 일시 (날짜 | 시간)
  - 공연 장소
- 티켓 정보
  - 좌석 등급별 그룹화
    - 등급명 (예: VIP석, R석)
    - 좌석 위치 리스트 (예: A열 1번, A열 2번)
    - 할인방법 및 가격
- 예약자 정보 입력 폼
  - 예약자명 (readOnly - 로그인 사용자 정보)
  - 생년월일 (readOnly - 로그인 사용자 정보)
  - 이메일 (입력 필수)
  - 휴대폰 번호 (입력 필수)
- 약관 동의
  - 개인정보 수집·이용 동의 (필수)
  - 취소·환불 규정 동의 (필수)

**우측 섹션: 총 결제정보**
- 티켓 총 금액
- 예매 수수료
- 총 결제금액
- 결제 버튼

#### Zod 스키마
```typescript
// entities/booking/model/booking.schema.ts
export const bookingPaymentSchema = z.object({
  bookingId: z.number(),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)"),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: "개인정보 수집·이용에 동의해주세요"
  }),
  agreeToRefund: z.boolean().refine(val => val === true, {
    message: "취소·환불 규정에 동의해주세요"
  }),
});

export type BookingPaymentForm = z.infer<typeof bookingPaymentSchema>;
```

#### API
- `POST /api/bookings/{bookingId}/confirm`
  - Request Body:
    ```typescript
    {
      email: string;
      phone: string;
      agreeToPrivacy: boolean;
      agreeToRefund: boolean;
    }
    ```
  - Response:
    ```typescript
    {
      success: boolean;
      bookingNumber: string;
      paymentUrl?: string; // PG사 결제 페이지 URL (필요시)
    }
    ```

#### 검증 로직
- 필수 입력 항목 검증
- 이메일 형식 검증
- 휴대폰 번호 형식 검증 (010-0000-0000)
- 약관 동의 체크 검증
- 타이머 만료 여부 확인

#### 에러 처리
- 타이머 만료
  - "예매 시간이 만료되었습니다. 다시 시도해주세요"
  - 좌석 선택 화면으로 리다이렉트
- 필수 항목 미입력
  - 각 필드별 에러 메시지 표시
- 결제 확인 실패
  - "결제를 완료할 수 없습니다. 다시 시도해주세요"
- 네트워크 오류
  - "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요"

---

## 3. 화면 플로우 다이어그램

### 3.1 전체 예매 플로우
```
┌─────────────────┐
│  좌석 선택      │ (mode: "view")
│  (기존 화면)    │
└────────┬────────┘
         │ 좌석 선택 완료
         ▼
┌─────────────────┐
│ 할인방법 선택   │ (mode: "payment")
│                 │
│ [좌석배치도]    │ ← 선택된 좌석만 표시 (선택 불가)
│ [할인 선택]     │ ← Accordion 형태
└────────┬────────┘
         │ POST /api/bookings/start
         │ ← { bookingId, expiresAt }
         ▼
┌─────────────────┐
│     결제        │
│                 │
│ [타이머]        │ ← expiresAt 기준 카운트다운
│ [주문상세]      │
│ [예약자정보]    │
│ [총 결제금액]   │
└────────┬────────┘
         │ POST /api/bookings/{id}/confirm
         │ ← { success, bookingNumber }
         ▼
┌─────────────────┐
│  예매 완료      │
└─────────────────┘
```

### 3.2 상태 전환
```
좌석 선택 단계
  ↓ 사용자 액션: "다음" 버튼 클릭
  ↓ 조건: 1~4개 좌석 선택됨
할인방법 선택 단계
  ↓ 사용자 액션: "예매하기" 버튼 클릭
  ↓ 조건: 모든 좌석의 할인방법 선택 완료
  ↓ API: POST /api/bookings/start
결제 단계
  ↓ 사용자 액션: "결제" 버튼 클릭
  ↓ 조건: 예약자 정보 입력 + 약관 동의
  ↓ API: POST /api/bookings/{id}/confirm
예매 완료
```

### 3.3 예외 플로우
```
할인방법 선택 단계
  ← "뒤로" 버튼
좌석 선택 단계 (좌석 선택 유지)

결제 단계
  ← 타이머 만료 (expiresAt 초과)
좌석 선택 단계 (좌석 선택 초기화)
```

---

## 4. 컴포넌트 계층 구조

### 4.1 할인방법 선택 화면
```
BookingDiscountSelectionView (views)
├── SeatChart (shared/lib/seat)
│   └── mode="payment" (선택 불가 모드)
└── DiscountSelectionPanel (widgets)
    ├── BackButton
    ├── DiscountGradeAccordion (features)
    │   └── GradeItem[]
    │       ├── GradeHeader (등급명, 좌석 수, 총액)
    │       └── DiscountMethodList
    │           └── DiscountMethodItem[]
    │               ├── 할인명
    │               ├── 가격
    │               └── QuantityControl (- | 수량 | +)
    ├── TotalPrice
    └── SubmitButton ("예매하기")
```

### 4.2 결제 화면
```
BookingPaymentView (views)
├── BookingTimer (features/booking-timer)
│   └── expiresAt 기준 카운트다운
├── OrderDetailSection (widgets)
│   ├── PerformanceInfo (공연명, 일시, 장소)
│   ├── TicketInfoList
│   │   └── TicketGradeGroup[]
│   │       ├── 등급명
│   │       ├── 좌석 리스트
│   │       └── 할인방법 및 가격
│   ├── BookerInfoForm (features)
│   │   ├── Input (예약자명 - readOnly)
│   │   ├── Input (생년월일 - readOnly)
│   │   ├── Input (이메일)
│   │   └── Input (휴대폰)
│   └── TermsAgreement
│       ├── Checkbox (개인정보 동의)
│       └── Checkbox (취소환불 동의)
└── PaymentSummarySection (widgets)
    ├── PriceBreakdown
    │   ├── 티켓 총 금액
    │   ├── 예매 수수료
    │   └── 총 결제금액
    └── PaymentButton
```

### 4.3 FSD 레이어 배치
```
src/
├── views/service/
│   ├── booking-seating-chart/        # (기존) 좌석 선택
│   ├── booking-discount-selection/   # 할인방법 선택 (신규)
│   │   └── BookingDiscountSelectionView.tsx
│   └── booking-payment/              # 결제 (신규)
│       └── BookingPaymentView.tsx
│
├── widgets/booking/
│   ├── discount-selection-panel/     # 할인 선택 패널
│   ├── order-detail-section/         # 주문 상세
│   └── payment-summary-section/      # 결제 요약
│
├── features/booking/
│   ├── discount-grade-accordion/     # 등급별 할인 Accordion
│   ├── booking-timer/                # 예매 타이머
│   └── booker-info-form/             # 예약자 정보 폼
│
└── entities/
    ├── booking/
    │   ├── api/
    │   ├── model/
    │   │   ├── booking.schema.ts     # Zod 스키마
    │   │   └── booking.types.ts
    │   └── index.ts
    └── discount/
        ├── api/
        ├── model/
        └── index.ts
```

---

## 5. 테스트 시나리오

### 5.1 정상 플로우

#### 시나리오 1: 단일 등급 좌석 예매
1. **좌석 선택 화면**
   - VIP석 2개 선택
   - "다음" 버튼 클릭
2. **할인방법 선택 화면**
   - VIP석 Accordion 펼치기
   - 일반가 1개 + 조기예매 1개 선택
   - 총 금액 확인
   - "예매하기" 버튼 클릭
3. **결제 화면**
   - 타이머 정상 동작 확인 (5분 카운트다운)
   - 예약자 정보 입력 (이메일, 휴대폰)
   - 약관 동의 체크
   - "결제" 버튼 클릭
4. **예매 완료**
   - 예매 번호 발급 확인

#### 시나리오 2: 다중 등급 좌석 예매
1. **좌석 선택 화면**
   - VIP석 1개 + R석 2개 선택 (총 3개)
   - "다음" 버튼 클릭
2. **할인방법 선택 화면**
   - VIP석: 일반가 1개 선택
   - R석: 조기예매 2개 선택
   - 총 금액 확인
   - "예매하기" 버튼 클릭
3. **결제 화면** (이후 동일)

### 5.2 예외 케이스

#### 시나리오 3: 할인방법 선택 중 뒤로가기
1. **좌석 선택 화면**
   - VIP석 2개 선택
   - "다음" 버튼 클릭
2. **할인방법 선택 화면**
   - "< 뒤로" 버튼 클릭
3. **좌석 선택 화면**
   - 기존 선택한 VIP석 2개 유지 확인
   - 좌석 재선택 가능 확인

#### 시나리오 4: 할인방법 수량 불일치
1. **할인방법 선택 화면**
   - VIP석 2개 선택됨
   - 할인방법 1개만 선택
   - "예매하기" 버튼 비활성화 확인
   - 에러 메시지: "선택한 좌석 수와 할인방법 수량이 일치하지 않습니다"

#### 시나리오 5: 결제 타이머 만료
1. **결제 화면**
   - 타이머 5분 대기 (또는 시간 조작)
   - 타이머 만료 시
   - 자동 리다이렉트: 좌석 선택 화면
   - 안내 메시지: "예매 시간이 만료되었습니다. 다시 시도해주세요"
   - 좌석 선택 초기화 확인

#### 시나리오 6: 좌석 선점 실패 (동시 예매)
1. **할인방법 선택 화면**
   - 사용자 A, B가 동일 좌석 선택
   - 사용자 A가 먼저 "예매하기" 클릭
   - 사용자 B가 "예매하기" 클릭
   - 사용자 B에게 에러 메시지: "선택한 좌석이 이미 예약되었습니다. 다시 선택해주세요"
   - 좌석 선택 화면으로 리다이렉트

#### 시나리오 7: 예약자 정보 입력 오류
1. **결제 화면**
   - 잘못된 이메일 형식 입력 (예: "test@")
   - 에러 메시지: "올바른 이메일 형식이 아닙니다"
   - 잘못된 휴대폰 번호 입력 (예: "010-123-456")
   - 에러 메시지: "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)"
   - 약관 동의 체크 안 함
   - "결제" 버튼 비활성화 또는 에러 메시지 표시

#### 시나리오 8: API 호출 실패
1. **할인방법 선택 화면**
   - 네트워크 오류 시뮬레이션
   - "예매하기" 버튼 클릭
   - 에러 메시지: "예매를 시작할 수 없습니다. 다시 시도해주세요"
   - 재시도 가능 확인

2. **결제 화면**
   - 네트워크 오류 시뮬레이션
   - "결제" 버튼 클릭
   - 에러 메시지: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
   - 입력한 정보 유지 확인

### 5.3 엣지 케이스

#### 시나리오 9: 최대 좌석 수 선택 (4개)
1. **좌석 선택 화면**
   - 4개 좌석 선택 (최대치)
   - 5번째 좌석 선택 시도
   - 선택 불가 또는 첫 번째 선택 해제 후 5번째 선택

#### 시나리오 10: 페이지 새로고침
1. **할인방법 선택 화면**
   - 새로고침 (F5)
   - 좌석 선택 화면으로 리다이렉트 또는 상태 복원

2. **결제 화면**
   - 새로고침 (F5)
   - bookingId 기준으로 상태 복원
   - 타이머 정상 동작 확인

---

## 6. 참고 사항

### 6.1 기존 구현 파일
- `src/views/service/booking-seating-chart/BookingSeatingChartView.tsx` - 좌석 선택 화면
- `src/features/service/booking-seating-chart/` - 좌석 선택 관련 features
- `src/shared/lib/seat/` - 좌석 배치도 라이브러리
- `src/shared/constants/routes.ts` - PAGES 상수 (라우팅)

### 6.2 사용 라이브러리
- **React Hook Form** - 폼 관리 (예약자 정보 입력)
- **Zod** - 스키마 검증 (유효성 검사)
- **TanStack Query** - 서버 상태 관리 (API 호출)
- **Seat Chart Library** - 좌석 배치도 시각화
- **Shadcn UI** - UI 컴포넌트 (Button, Input, Accordion 등)

### 6.3 코딩 규칙 (CLAUDE.md 준수)
- **주석 작성**
  - 함수: JSDoc (목적, @param, @returns) 필수
  - 인터페이스: 프로퍼티별 `/** 설명 */` 필수
  - 5줄 이상 분기문: 로직 설명 주석 필수
- **컴포넌트**
  - Server Component 우선 (상호작용 필요시만 `'use client'`)
  - FSD Public API: index.ts를 통한 export만 허용
- **라우팅**
  - `PAGES` 상수 사용 필수 (`src/shared/constants/routes.ts`)
  - 메타데이터 설정 필수
- **스타일**
  - Shadcn UI 컴포넌트 활용
  - `@/shared/ui`에서 import

### 6.4 구현 시 주의사항
- **좌석 차트 모드 확장**
  - `SeatChartMode`에 `"payment"` 모드 추가 필요
  - `src/shared/lib/seat/types/seatLayout.types.ts:85` 수정
- **상태 관리**
  - 할인 선택 상태는 로컬 상태로 관리
  - 예매 ID는 URL 쿼리 파라미터로 전달
  - 타이머는 `expiresAt` 기준으로 클라이언트에서 계산
- **에러 처리**
  - API 에러는 사용자 친화적 메시지로 변환
  - 타이머 만료는 자동 리다이렉트 + 토스트 메시지
  - 네트워크 오류는 재시도 옵션 제공

### 6.5 API 명세 확인 필요
다음 API가 백엔드에 구현되어 있는지 확인:
- `POST /api/bookings/start` - 예매 시작
- `POST /api/bookings/{bookingId}/confirm` - 예매 확정
- `GET /api/discounts?scheduleId={id}` - 할인방법 목록 조회 (필요시)
