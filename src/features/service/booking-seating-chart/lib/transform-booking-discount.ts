/**
 * 예매 할인 폼 데이터 변환 유틸리티
 */
import type { SeatCouponRequest } from "@/shared/api/orval/types";
import type { SeatTotalInfo } from "../../booking-process";
import type { BookingDiscountFormData } from "../model/booking-discount.schema";

/**
 * 폼 데이터를 서버 API 형식으로 변환합니다
 * - 폼: 등급별 할인 방법 그룹화 { VIP: { "couponId": quantity } }
 * - API: 좌석별 쿠폰 할당 배열 [{ bookingSeatId, couponId, originalPrice }]
 *
 * @param formData - 등급별 할인 방법 데이터
 * @param seats - 선택된 좌석 정보 (ID, 등급, 가격)
 * @returns 서버 전송용 좌석별 쿠폰 적용 요청 배열
 */
export function transformToSeatCoupons(
  formData: BookingDiscountFormData,
  seatsOfGrade: SeatTotalInfo[],
): SeatCouponRequest[] {
  const result: SeatCouponRequest[] = [];

  /**
   * 등급별로 순회하며 할인 방법을 좌석에 할당
   * - 각 등급의 좌석 목록을 가져옴
   * - 할인 방법별 수량만큼 좌석에 쿠폰 할당
   */
  let seatIndex = 0;
  Object.entries(formData).forEach(([grade, discounts]) => {
    /**
     * 할인 방법별로 수량만큼 좌석에 쿠폰 할당
     * - couponId: 쿠폰 ID (문자열을 숫자로 변환)
     * - quantity: 할당할 좌석 수
     */
    Object.entries(discounts).forEach(([couponId, quantity]) => {
      for (let i = 0; i < quantity; i++) {
        const seat = seatsOfGrade[seatIndex];
        if (seat) {
          result.push({
            bookingSeatId: seat.id,
            couponId: Number(couponId),
            originalPrice: seat.price || 0,
          });
          seatIndex++;
        }
      }
    });
  });

  return result;
}
