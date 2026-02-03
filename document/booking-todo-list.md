# 예매 프로세스 TODO 리스트

## 🔴 미해결 이슈

### 1. 점유 시간 확인 및 데이터 정합성
- **문제**: 점유 시간 변경 요청했으나 남은시간 데이터가 변경되지 않음
- **해결 방안**:
  - 서버 점유 시간 설정 확인
  - API 응답 데이터 확인
  - 프론트엔드 타이머 로직과 서버 시간 동기화
- **상태**: ❌ 미해결

### 2. SSE 연결 종료 케이스 및 처리
- **문제**: SSE가 닫힐 케이스가 언제인지, 어떻게 처리할지 불명확
- **해결 방안**:
  - SSE 연결 종료 케이스 정의
    - 예매 완료
    - 예매 취소
    - 타임아웃
    - 네트워크 오류
  - 각 케이스별 재연결 또는 종료 처리 로직 구현
- **상태**: ❌ 미해결

### 3. 모바일 화면 대응
- **문제**: 모바일 화면 최적화 필요
- **해결 방안**: 반응형 UI 개선
- **상태**: ❌ 미해결

### 4. PG 결제 팝업 중 타이머 만료 처리 (Payment Lock)
- **문제**:
  - PG 결제 팝업이 떠 있는 동안에도 클라이언트 타이머가 계속 동작함.
  - 사용자가 결제를 진행 중임에도 시간이 만료되면 `handleTimerExpire`가 동작하여 강제로 홈/상세페이지로 이동됨.
  - 이로 인해 결제는 성공했으나 예매 확정 요청을 보내지 못하는 "미아 결제" 발생 가능성 있음.

- **해결 방안 (Payment Lock 전략)**:
  1. **상태 관리**: `BookingStepStore`에 `isPaymentProcessing` 플래그 추가 (PG 팝업 오픈 시 `true`, 종료 시 `false`).
  2. **타이머 제어**: `BookingHeader`의 타이머 만료 핸들러에서 `isPaymentProcessing`이 `true`일 경우 리다이렉트를 막고 대기.
  3. **최종 처리 (Edge Case)**:
     - PG 결제 성공 후 `confirmBooking` 호출 시점에는 이미 시간이 만료되었을 수 있음.
     - 서버에서 "만료된 예매" 에러 반환 시, 클라이언트는 이를 감지하여 "결제는 되었으나 시간이 만료되어 자동 취소됩니다" 알림 표시.
     - 결제 취소 API 호출하여 환불 처리.

- **상태**: ❌ 미해결

---

## ✅ 해결 완료

### ~~1. 다른 사람 점유 시 처리~~
- **해결 방법**:
  - `useSeatChart.ts`의 `updateBookingStatus` 함수에서 실시간 충돌 체크(`enableConflictCheck`) 로직 구현
  - SSE를 통해 타인의 점유(`pending`) 또는 예약(`reserved`) 정보 수신 시, 사용자가 선택한 좌석과 겹치면 토스트 메시지 알림 및 선택 자동 해제 처리
- **관련 파일**:
  - `src/shared/lib/useSeatChart.ts`
- **상태**: ✅ 완료

---

### ~~2. 뒤로가기 시 스토리지 제거 / 브라우저·탭 닫기 이벤트 처리~~
- **해결 방법**:
  - `BookingResetWatcher.tsx`를 통해 `/booking` 경로 이탈 및 브라우저 종료 감지
  - `navigator.sendBeacon`을 사용하여 페이지 종료 시에도 좌석 해제 API(`releaseBooking`) 호출 보장
  - `BookingHeader.tsx`에서 `popstate` 감지를 통해 Step 간 이동 및 상태 초기화 관리
- **관련 파일**:
  - `src/app/providers/BookingResetWatcher.tsx`
  - `src/widgets/booking-header/ui/BookingHeader.tsx`
- **상태**: ✅ 완료

---

### ~~5. Step3 → Step2 이동 시 404 페이지 깜빡임~~
- **문제**: 결제 화면(Step3)에서 좌석 선택(Step2)으로 이동 시 잠깐 404 페이지 보임
- **해결 방법**:
  - `BookingHeader.tsx`에서 `isHydrated` 상태를 도입하여 Zustand 상태 복원 전 리다이렉트 방지
  - `BookingPayment.tsx`에서 `paymentInfo` 로딩 중 `notFound()` 대신 `null`을 반환하여 라우팅 충돌 해결
- **관련 파일**:
  - `src/widgets/booking-header/ui/BookingHeader.tsx`
  - `src/features/booking/payment/ui/BookingPayment.tsx`
- **상태**: ✅ 완료

---

### ~~8. 결제가능시간 만료 시 404 화면 이동~~
- **문제**:
  - 결제 화면에서 결제가능시간이 만료되면 404 화면으로 이동됨
  - `BookingHeader`와 `BookingPayment`에서 동시에 페이지 리다이렉트를 시도하여 충돌 발생

- **해결 방법**:
  1. **BookingHeader에서 결제 페이지 체크**:
     - Zustand hydration 완료 후에만 체크하여 false positive 방지
     - `paymentData`가 없으면 홈으로 리다이렉트
  2. **BookingPayment에서 early return 처리**:
     - `notFound()` 대신 `null` 반환으로 변경하여 라우팅 충돌 방지
  3. **타이머 만료 시 처리**:
     - `handleTimerExpire`에서 store 초기화 후 공연 상세 페이지로 이동

- **관련 파일**:
  - `src/widgets/booking-header/ui/BookingHeader.tsx`
  - `src/features/service/booking-payment/ui/BookingPayment.tsx`

- **상태**: ✅ 완료 (2026-01-12)

---

### ~~결제화면에서 타이머가 다시 갱신됨, 새로고침 시에도~~
- **문제**: step 이동 시 타이머가 초기값으로 리셋되는 문제
- **해결 방법**:
  - `remainingSeconds` 대신 서버에서 내려주는 절대 시간인 `expiresAt`(ISO 8601)을 사용하도록 변경
  - `BookingTimer.tsx`에서 매초 현재 시간과 `expiresAt`의 차이를 계산하여 정확한 남은 시간 표시
- **관련 파일**:
  - `src/widgets/booking-header/ui/BookingTimer.tsx`
  - `src/widgets/booking-header/ui/BookingHeader.tsx`
- **상태**: ✅ 완료 (2026-01-12)

---

## 📝 메모
- 이슈 해결 시 해당 항목을 "✅ 해결 완료" 섹션으로 이동
- 각 이슈 해결 시 관련 파일 경로 및 커밋 해시 기록
