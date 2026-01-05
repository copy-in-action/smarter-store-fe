/**
 * 결제 확인 데이터 생성 유틸리티
 */
import type {
  BookingResponse,
  PerformanceResponse,
  SeatGrade,
} from "@/shared/api/orval/types";
import type {
  PaymentConfirmationData,
  UserSelectedSeat,
} from "../model/booking-seating-chart.types";
import type { BookingDiscountSubmitData } from "../ui/BookingDiscountSelectionForm";

/**
 * BookingResponse와 할인 선택 데이터를 결제 확인 데이터로 변환
 * @param bookingData - 예매 응답 데이터
 * @param discountData - 할인 선택 데이터
 * @param bookingFee - 예매 수수료 (좌석당)
 * @returns 결제 확인 데이터
 */
export function createPaymentConfirmationData(
  performance: PerformanceResponse,
  bookingData: BookingResponse,
  discountData: BookingDiscountSubmitData,
  userSelectedSeats: UserSelectedSeat[],
  scheduleId: number,
): PaymentConfirmationData {
  /**


  /**
   * 티켓 상세 정보 생성
   * - 등급별 좌석 정보와 할인 정보 조합
   */
  const ticketDetails = Object.entries(discountData).map(
    ([grade, discountItems]) => {
      const gradeSeats = userSelectedSeats.filter(
        (seat) => seat.grade === grade,
      );

      return {
        grade: grade as SeatGrade,
        seatCount: gradeSeats.length,
        seats: gradeSeats.map((seat) => ({
          row: seat.row,
          col: seat.col,
          section: "1층", //FIXME:
        })),

        priceInfo: discountItems.map((item) => ({
          discountName: item.name,
          quantity: item.count,
          unitPrice: item.price,
          totalPrice: item.price * item.count,
        })),
      };
    },
  );

  /**
   * 티켓 총 금액 계산
   * - 각 등급별 할인 방법의 총 가격 합계
   */
  const ticketAmount = ticketDetails.reduce(
    (sum, detail) =>
      sum +
      detail.priceInfo.reduce(
        (gradeSum, info) => gradeSum + info.totalPrice,
        0,
      ),
    0,
  );

  /**
   * 예매 수수료 계산
   * - 전체 좌석 수 × bookingFee
   */
  const totalSeatCount = bookingData.seats.length;
  const totalBookingFee = totalSeatCount * (performance?.bookingFee || 0);

  return {
    performance: performance,
    scheduleId,
    booking: {
      bookingId: bookingData.bookingId,
      bookingNumber: bookingData.bookingNumber,
      remainingSeconds: bookingData.remainingSeconds,
    },
    ticketDetails,
    payment: {
      ticketAmount,
      bookingFee: totalBookingFee,
      totalAmount: ticketAmount + totalBookingFee,
    },
  };
}
