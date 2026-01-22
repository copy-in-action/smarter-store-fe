/**
 * 쿠폰 관련 순수 API 함수들
 */

import { getAvailableCoupons } from "@/shared/api/orval/coupon/coupon";
import type { AvailableCouponResponse } from "@/shared/api/orval/types";

/**
 * 모든 사용 가능한 쿠폰을 조회합니다.
 * @returns 사용 가능한 쿠폰 목록
 */
export const getCouponsApi = async (): Promise<AvailableCouponResponse[]> => {
  const response = await getAvailableCoupons();

  if (response.status !== 200) {
    throw new Error("쿠폰 목록을 불러오는 데 실패했습니다.");
  }

  return response.data;
};
