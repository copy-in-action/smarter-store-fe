/**
 * 쿠폰 관련 React Query 훅들
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCoupon,
  deactivateCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
} from "@/shared/api/orval/admin-coupon/admin-coupon";
import { validateCoupons } from "@/shared/api/orval/coupon/coupon";
import type {
  AvailableCouponResponse,
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
  CouponValidateRequest,
  CouponValidateResponse,
} from "@/shared/api/orval/types";
import { getCouponsApi } from "./coupon.api";

/**
 * 쿠폰 쿼리 키
 */
export const couponQueryKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponQueryKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...couponQueryKeys.lists(), { filters }] as const,
  details: () => [...couponQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...couponQueryKeys.details(), id] as const,
};

/**
 * 사용 가능한 쿠폰 목록을 조회하는 쿼리 훅
 * @returns 쿠폰 목록 쿼리 결과 (data, isLoading, error 등)
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
 * @returns mutation 결과 (mutate, mutateAsync, isLoading, error 등)
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

/**
 * 모든 쿠폰 목록을 조회합니다 (관리자용)
 * @returns 쿠폰 목록 쿼리
 */
export function useGetAllCoupons() {
  return useQuery({
    queryKey: couponQueryKeys.lists(),
    queryFn: async (): Promise<CouponResponse[]> => {
      const response = await getAllCoupons();
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("쿠폰 목록 조회에 실패했습니다");
    },
  });
}

/**
 * 특정 쿠폰 정보를 조회합니다 (관리자용)
 * @param id - 쿠폰 ID
 * @returns 쿠폰 상세 정보 쿼리
 */
export function useGetCoupon(id: number) {
  return useQuery({
    queryKey: couponQueryKeys.detail(id),
    queryFn: async (): Promise<CouponResponse> => {
      const response = await getCoupon(id);
      if (response.data) {
        return response.data as CouponResponse;
      }
      throw new Error("쿠폰 정보 조회에 실패했습니다");
    },
    enabled: !!id,
  });
}

/**
 * 새로운 쿠폰을 생성하는 뮤테이션 (관리자용)
 * @returns 쿠폰 생성 뮤테이션
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CouponCreateRequest): Promise<CouponResponse> => {
      const response = await createCoupon(data);
      if (response.data) {
        return response.data as CouponResponse;
      }
      throw new Error("쿠폰 생성에 실패했습니다");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.lists() });
    },
  });
}

/**
 * 쿠폰을 비활성화하는 뮤테이션 (관리자용)
 * @returns 쿠폰 비활성화 뮤테이션
 */
export function useDeactivateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await deactivateCoupon(id);
      if (response.status === 200) {
        return;
      }
      throw new Error("쿠폰 비활성화에 실패했습니다");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.lists() });
    },
  });
}

/**
 * 쿠폰을 수정하는 뮤테이션 (관리자용)
 * @returns 쿠폰 수정 뮤테이션
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CouponUpdateRequest;
    }): Promise<CouponResponse> => {
      const response = await updateCoupon(id, data);
      if (response.data) {
        return response.data as CouponResponse;
      }
      throw new Error("쿠폰 수정에 실패했습니다");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: couponQueryKeys.detail(variables.id),
      });
    },
  });
}
