/**
 * 예매 프로세스 타입 정의
 * entities/booking 타입을 re-export하여 하위 호환성 유지
 * @deprecated 새 코드에서는 @/entities/booking에서 직접 import하세요
 */

export type {
  GradeInfo,
  PaymentConfirmationData,
  PaymentInfo,
  PriceInfo,
  SeatGradeInfo,
  SeatTotalInfo,
  TicketDetail,
  UserSelectedSeat,
} from "@/entities/booking";
