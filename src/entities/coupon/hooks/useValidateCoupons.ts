import { useMutation } from "@tanstack/react-query";
import { validateCoupons } from "@/shared/api/orval/coupon/coupon";
import type {
  CouponValidateRequest,
  CouponValidateResponse,
} from "@/shared/api/orval/types";

/**
 * 좌석별 쿠폰 적용을 검증하는 mutation 훅
 * - 좌석별로 선택된 쿠폰의 유효성을 검증
 * - 할인 금액을 계산하여 반환
 * @returns {object} mutation 결과 (mutate, mutateAsync, isLoading, error 등)
 */
export const useValidateCoupons = () => {
  return useMutation<
    CouponValidateResponse,
    Error,
    CouponValidateRequest,
    unknown
  >({
    mutationFn: async (request: CouponValidateRequest) => {
      const response = await validateCoupons(request);

      if (response.status === 200) {
        return response.data;
      }

      throw new Error(
        response.status === 400
          ? response.data.message
          : "할인 검증에 실패했습니다.",
      );
    },
  });
};