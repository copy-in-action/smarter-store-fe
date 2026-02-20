/**
 * entities/booking API
 * Orval 생성 API의 re-export 및 wrapper
 */

// Orval 생성 API re-export
export {
  cancelBooking,
  getBookingDetail,
  getMyBookings,
} from "@/shared/api/orval/booking/booking";

// 타입 re-export
export type {
  BookingDetailResponse,
  BookingHistoryResponse,
  BookingSeatResponse,
  PaymentDetailResponse,
} from "@/shared/api/orval/types";

// enum re-export (런타임 값 - export type 불가)
export { BookingStatus } from "@/shared/api/orval/types";
