/**
 * 결제 확인 데이터 생성 유틸리티
 */
import type {
  AvailableCouponResponse,
  BookingResponse,
  CouponValidateResponse,
  PerformanceResponse,
  SeatGrade,
} from "@/shared/api/orval/types";
import type {
  PaymentConfirmationData,
  PriceInfo,
  SeatTotalInfo,
  TicketDetail,
 } from "@/entities/booking";

/**
 * BookingResponse와 할인 검증 결과를 결제 확인 데이터로 변환
 * @param performance - 공연 정보
 * @param bookingData - 예매 응답 데이터
 * @param validationResponse - 쿠폰 검증 응답 데이터
 * @param scheduleId - 공연 회차 ID
 * @param seatInfos - 좌석 정보 배열
 * @param coupons - 사용 가능한 쿠폰 목록
 * @returns 결제 확인 데이터
 */
export function createPaymentConfirmationData(
  performance: PerformanceResponse,
  bookingData: BookingResponse,
  validationResponse: CouponValidateResponse,
  scheduleId: number,
  seatInfos: SeatTotalInfo[],
  coupons: AvailableCouponResponse[],
): PaymentConfirmationData {
  /**
   * 쿠폰 ID로 쿠폰명 조회용 Map
   */
  const couponMap = new Map(coupons.map((c) => [c.id, c.name]));

  /**
   * 좌석별 할인 정보 매핑
   * - validationResponse.results를 기반으로 각 좌석의 할인 정보 추가
   */
  const seatsWithDiscount = seatInfos.map((seat) => {
    const result = validationResponse.results.find(
      (r) => r.bookingSeatId === seat.id,
    );

    return {
      ...seat,
      couponId: result?.couponId,
      discountName: result?.couponId
        ? couponMap.get(result.couponId) || "할인"
        : "일반",
      finalPrice: result?.finalPrice || seat.price,
      discountAmount: result?.discountAmount || 0,
    };
  });

  /**
   * 등급별로 그룹화
   */
  const groupedByGrade = seatsWithDiscount.reduce(
    (acc, seat) => {
      if (!acc[seat.grade]) {
        acc[seat.grade] = [];
      }
      acc[seat.grade].push(seat);
      return acc;
    },
    {} as Record<SeatGrade, typeof seatsWithDiscount>,
  );

  /**
   * 티켓 상세 정보 생성
   * - 등급별로 할인명별 가격 정보 집계
   */
  const ticketDetails: TicketDetail[] = Object.entries(groupedByGrade).map(
    ([grade, gradeSeats]) => {
      /**
       * 할인명별로 그룹화하여 PriceInfo 생성
       */
      const priceInfoMap = gradeSeats.reduce(
        (acc, seat) => {
          const key = seat.discountName;
          if (!acc[key]) {
            acc[key] = {
              discountName: key,
              quantity: 0,
              unitPrice: seat.finalPrice,
              totalPrice: 0,
            };
          }
          acc[key].quantity += 1;
          acc[key].totalPrice += seat.finalPrice;
          return acc;
        },
        {} as Record<string, PriceInfo>,
      );

      const priceInfo = Object.values(priceInfoMap);

      return {
        grade: grade as SeatGrade,
        seatCount: gradeSeats.length,
        seats: gradeSeats.map((seat) => ({
          row: seat.row,
          col: seat.col,
          section: seat.section,
        })),
        priceInfo,
      };
    },
  );

  /**
   * 티켓 총 금액 계산
   * - validationResponse의 totalFinalPrice 사용
   */
  const ticketAmount = validationResponse.totalFinalPrice;
  const totalBookingFee = performance?.bookingFee || 0;

  return {
    performance: {
      id: performance.id,
      venue: performance.venue,
      title: performance.title,
    },
    scheduleId,
    booking: {
      bookingId: bookingData.bookingId,
      bookingNumber: bookingData.bookingNumber,
    },
    ticketDetails,
    payment: {
      ticketAmount,
      bookingFee: totalBookingFee,
      totalAmount: ticketAmount + totalBookingFee,
    },
  };
}
