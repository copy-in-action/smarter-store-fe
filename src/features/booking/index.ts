/**
 * Booking Feature - Public API
 * 예매 관련 모든 기능을 통합 관리
 */

export type {
  GradeInfo,
  PaymentConfirmationData,
  PriceInfo,
  SeatGradeInfo,
  SeatTotalInfo,
  TicketDetail,
  UserSelectedSeat,
} from "@/entities/booking";
// ===== Model (공유 상태 및 타입) =====
export {
  BookingStep,
  useBookingStepStore,
} from "./model/booking-step.store";
export type { PaymentFormData } from "./payment";
// ===== Payment (결제) =====
export {
  BookingPayment,
  BookingPaymentInfo,
  PaymentMethodSelector,
  paymentFormSchema,
  ReservationInfo,
  TermsAgreement,
  TicketOrderDetail,
  useConfirmBooking,
  useCreatePayment,
  useGetPerformanceSchedule,
} from "./payment";
// ===== Process (프로세스 관리 UI) =====
export { BookingUnloadManager } from "./process/ui/BookingUnloadManager";
export type { BookingDiscountFormData } from "./seating-chart";
// ===== Seating Chart (좌석 선택 + 할인) =====
export {
  BookingSeatingChart,
  createBookingDiscountSchema,
  useAvailableSchedulesByDate,
  useCancelBooking,
  useStartBooking,
} from "./seating-chart";
