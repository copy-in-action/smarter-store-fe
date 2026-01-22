import { useMutation, useQuery } from "@tanstack/react-query";
import { validateCoupons } from "@/shared/api/orval/coupon/coupon";
import type {
  AvailableCouponResponse,
  CouponValidateRequest,
  CouponValidateResponse,
} from "@/shared/api/orval/types";
import { getCouponsApi } from "./coupon.api";

/**
 * 사용 가능한 쿠폰 목록을 조회하는 쿼리 훅
 * @returns {object} 쿠폰 목록 쿼리 결과 (data, isLoading, error 등)
 */
export const useCouponsQuery = () => {
  return useQuery<AvailableCouponResponse[]>({
    queryKey: ["coupons"],
    queryFn: getCouponsApi,
    staleTime: 1000 * 60 * 60, // 1시간 동안 데이터를 stale 상태로 두지 않음
    gcTime: 1000 * 60 * 60 * 6, // 6시간 동안 캐시 유지
  });
};

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
