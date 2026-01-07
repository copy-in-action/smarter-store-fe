import { useQuery } from "@tanstack/react-query";
import type { AvailableCouponResponse } from "@/shared/api/orval/types";
import { getCouponsApi } from "../api/coupon.api";

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
