/**
 * 예매 좌석 선택 기능 타입 정의
 */

import type {
  BookingResponse,
  PerformanceResponse,
  SeatGrade,
} from "@/shared/api/orval/types";
import type { SeatPosition } from "@/shared/lib/seat";

/**
 * 사용자가 선택한 좌석 정보
 */
export type UserSelectedSeat = SeatPosition & {
  /** 좌석 등급 */
  grade: SeatGrade;
  /** 좌석 가격 (원) */
  price: number;
};

/**
 * 좌석 등급별 가격 정보
 */
export interface SeatGradeInfo {
  /** 등급 라벨 */
  label: string;
  /** 가격 (원) */
  price: number;
}

/**
 * 할인 방법 정보 (API 응답 타입)
 */
export interface DiscountMethod {
  /** 할인 방법 ID */
  id: string;
  /** 할인 방법명 (예: "일반", "청소년", "경로우대") */
  name: string;
  /** 할인율 (0-100) */
  discountRate: number;
}

/**
 * 등급별 할인 방법 수량 선택
 */
export interface GradeDiscountSelection {
  /** 좌석 등급 */
  grade: SeatGrade;
  /** 할인 방법별 수량 { discountId: quantity } */
  discounts: Record<string, number>;
}

/**
 * 등급별 좌석 정보 (폼 컴포넌트용)
 */
export interface GradeInfo {
  /** 좌석 등급 */
  grade: SeatGrade;
  /** 선택된 좌석 수 */
  seatCount: number;
  /** 기본 가격 (원) */
  basePrice: number;
  /** 좌석 상세 정보 (예: "1열 2번 외 3건") */
  seatDetails: string;
}

/**
 * 좌석 선점 요청 타입
 */
export interface BookingSeatFormData {
  scheduleId: number;
  seats: SeatPosition[];
}

/**
 * 할인 방법별 가격 정보
 */
export interface PriceInfo {
  /** 할인 방법명 */
  discountName: string;
  /** 수량 */
  quantity: number;
  /** 단가 */
  unitPrice: number;
  /** 총 가격 */
  totalPrice: number;
}

/**
 * 등급별 티켓 상세 정보
 */
export interface TicketDetail {
  /** 좌석 등급 */
  grade: SeatGrade;
  /** 좌석 수 */
  seatCount: number;
  /** 좌석 목록 */
  seats: SeatPosition[];
  /** 가격 정보 */
  priceInfo: PriceInfo[];
}

/**
 * 결제 금액 정보
 */
export interface PaymentInfo {
  /** 티켓 금액 */
  ticketAmount: number;
  /** 예매 수수료 */
  bookingFee: number;
  /** 최종 결제 금액 */
  totalAmount: number;
}

/**
 * 결제 확인 데이터
 */
export interface PaymentConfirmationData {
  /** 공연 정보 */
  performance: PerformanceResponse;
  /** 공연 회차 ID */
  scheduleId: number;
  /** 예매 정보 (BookingResponse 기반) */
  booking: Pick<
    BookingResponse,
    "bookingId" | "bookingNumber" | "remainingSeconds"
  >;
  /** 등급별 좌석 및 할인 정보 */
  ticketDetails: TicketDetail[];
  /** 결제 금액 */
  payment: PaymentInfo;
}
