/**
 * entities/booking Public API
 * FSD 규칙: 순수 도메인 타입 및 API export
 */

export type {
  BookingDetailResponse,
  BookingHistoryResponse,
} from "./api/booking.api";
// API 및 타입 export
export {
  BookingStatus,
  cancelBooking,
  getBookingDetail,
  getMyBookings,
} from "./api/booking.api";

// React Query hooks export
export {
  bookingQueryKeys,
  useBookingDetailQuery,
  useCancelBookingMutation,
  useMyBookingsQuery,
  useReleaseBookingMutation,
} from "./api/booking.queries";
// 기존 타입 export (유지)
export type {
  GradeInfo,
  PaymentConfirmationData,
  PaymentDiscountRequestType,
  PaymentInfo,
  PriceInfo,
  SeatGradeInfo,
  SeatTotalInfo,
  TicketDetail,
  UserSelectedSeat,
} from "./model/booking.types";
// UI 컴포넌트 export
export { BookingStatusBadge } from "./ui/BookingStatusBadge";
