/**
 * Booking Feature - Public API
 * 예매 관련 모든 기능을 통합 관리
 */

// ===== Model (공유 상태 및 타입) =====
export {
  useBookingStepStore,
  BookingStep,
} from "./model/booking-step.store";
export type { UserSelectedSeat, PaymentConfirmationData, TicketDetail, SeatTotalInfo, GradeInfo, PriceInfo, SeatGradeInfo } from "@/entities/booking";

// ===== Seating Chart (좌석 선택 + 할인) =====
export {
  useAvailableSchedulesByDate,
  useCancelBooking,
  useStartBooking,
  useBookingSeatSelection,
  useBookingStepControl,
  useSeatSSESubscription,
  createPaymentConfirmationData,
  transformToSeatCoupons,
  transformToGradeInfoArray,
  createBookingDiscountSchema,
  BookingSeatingChart,
  SeatSelectionStep,
  DiscountSelectionStep,
  BookingDiscountSelectionForm,
  SeatGradePricePopover,
  SelectSeatInfo,
} from "./seating-chart";
export type { BookingDiscountFormData } from "./seating-chart";

// ===== Payment (결제) =====
export {
  useConfirmBooking,
  useCreatePayment,
  useGetPerformanceSchedule,
  paymentFormSchema,
  BookingPayment,
  BookingPaymentInfo,
  PaymentMethodSelector,
  ReservationInfo,
  TermsAgreement,
  TicketOrderDetail,
} from "./payment";
export type { PaymentFormData } from "./payment";

// ===== Process (프로세스 관리 UI) =====
export { BookingUnloadManager } from "./process/ui/BookingUnloadManager";
