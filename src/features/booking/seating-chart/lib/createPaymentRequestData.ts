/**
 * 결제 요청 데이터 생성 유틸리티
 */
import type {
  AvailableCouponResponse,
  BookingResponse,
  CouponValidateResponse,
  PaymentCreateRequest,
  PerformanceResponse,
} from "@/shared/api/orval/types";
import type { SeatTotalInfo  } from "@/entities/booking";

/**
 * 예매 데이터와 할인 검증 결과를 서버 전송용 결제 요청 데이터로 변환
 * @param bookingData - 예매 응답 데이터
 * @param validationResponse - 쿠폰 검증 응답 데이터
 * @param performance - 공연 정보
 * @param seatInfos - 좌석 정보 배열
 * @param coupons - 사용 가능한 쿠폰 목록
 * @returns 결제 요청 데이터 (paymentMethod, isAgreed 제외)
 */
export function createPaymentRequestData(
  bookingData: BookingResponse,
  validationResponse: CouponValidateResponse,
  performance: PerformanceResponse,
  seatInfos: SeatTotalInfo[],
  coupons: AvailableCouponResponse[],
): Omit<PaymentCreateRequest, "paymentMethod" | "isAgreed"> {
  /**
   * 쿠폰 ID로 쿠폰명 조회용 Map
   */
  const couponMap = new Map(coupons.map((c) => [c.id, c.name]));

  /**
   * 할인 정보 변환: validationResponse.results → AppliedDiscountDto[]
   */
  const discounts = validationResponse.results.map((result) => ({
    type: "COUPON" as const,
    name: couponMap.get(result.couponId!) || "할인",
    amount: result.discountAmount,
    couponId: result.couponId,
    bookingSeatId: result.bookingSeatId,
  }));

  /**
   * 티켓 총 금액 (할인 적용 후)
   */
  const ticketAmount = validationResponse.totalFinalPrice;

  /**
   * 예매 수수료
   */
  const totalSeatCount = bookingData.seats.length;
  const bookingFee = totalSeatCount * (performance?.bookingFee || 0);

  /**
   * 최종 결제 금액
   */
  const totalAmount = ticketAmount + bookingFee;

  /**
   * 원가 (할인 전 티켓 금액)
   */
  const originalPrice = seatInfos.reduce((sum, seat) => sum + seat.price, 0);

  return {
    bookingId: bookingData.bookingId,
    totalAmount,
    ticketAmount,
    bookingFee,
    originalPrice,
    discounts,
  };
}
