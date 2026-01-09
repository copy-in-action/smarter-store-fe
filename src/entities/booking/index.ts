/**
 * entities/booking Public API
 * FSD 규칙: index.ts를 통한 export만 허용
 */

// 변환 함수 export
export {
  transformSeatGradeInfo,
  transformToGradeInfoArray,
  transformUserSelectedSeats,
} from "./lib/seat-transformers";
// 타입 export
export type {
  GradeInfo,
  PaymentConfirmationData,
  PaymentInfo,
  PriceInfo,
  SeatGradeInfo,
  SeatTotalInfo,
  TicketDetail,
  UserSelectedSeat,
} from "./model/booking.types";
