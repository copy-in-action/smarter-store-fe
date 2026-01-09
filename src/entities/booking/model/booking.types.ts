/**
 * 예매 관련 타입 정의 (entities layer)
 * - 비즈니스 도메인 타입 중앙 관리
 * - features 레이어에서 사용
 */

import type {
  BookingResponse,
  PerformanceResponse,
  SeatGrade,
} from "@/shared/api/orval/types";
import type { SeatPosition } from "@/shared/lib/seat";

/**
 * 사용자가 선택한 좌석 정보
 * 용도: UI 표시, 가격 계산
 * 확장: SeatPosition + 등급 + 가격
 */
export type UserSelectedSeat = SeatPosition & {
  /** 좌석 등급 */
  grade: SeatGrade;
  /** 좌석 가격 (원) */
  price: number;
};

/**
 * 좌석 등급별 가격 정보
 * 용도: 등급별 가격 표시 (팝오버, 범례 등)
 */
export interface SeatGradeInfo {
  /** 등급 라벨 (VIP, R, S, A) */
  label: string;
  /** 가격 (원) */
  price: number;
}

/**
 * 등급별 좌석 정보 (폼 컴포넌트용)
 * 용도: 할인 선택 폼에서 등급별 그룹화된 좌석 정보 표시
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
 * 할인 방법별 가격 정보
 * 용도: 결제 화면에서 할인 방법별 가격 표시
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
 * 용도: 결제 화면에서 등급별 티켓 정보 표시
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
 * 용도: 결제 화면에서 금액 정보 표시
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
 * 용도: Step 3 (결제 화면)에서 사용할 최종 데이터
 */
export interface PaymentConfirmationData {
  /** 공연 정보 */
  performance: Pick<PerformanceResponse, "id" | "title" | "venue">;
  /** 공연 회차 ID */
  scheduleId: number;
  /** 예매 정보 (BookingResponse 기반) */
  booking: Pick<BookingResponse, "bookingId" | "bookingNumber">;
  /** 등급별 좌석 및 할인 정보 */
  ticketDetails: TicketDetail[];
  /** 결제 금액 */
  payment: PaymentInfo;
}

/**
 * 서버에서 받은 좌석 정보 (BookingSeatResponse + UserSelectedSeat 조합)
 * 용도: 결제 데이터 생성, 쿠폰 적용
 * 확장: UserSelectedSeat + id (서버에서 부여)
 */
export interface SeatTotalInfo extends UserSelectedSeat {
  /** 예매 좌석 ID */
  id: number;
}
