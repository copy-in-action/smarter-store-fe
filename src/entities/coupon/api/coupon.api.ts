import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCoupon,
  deactivateCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
} from "@/shared/api/orval/admin-coupon/admin-coupon";
import { getAvailableCoupons } from "@/shared/api/orval/coupon/coupon";
import type {
  AvailableCouponResponse,
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
} from "@/shared/api/orval/types";

/**
 * 모든 사용 가능한 쿠폰을 조회합니다.
 * @returns 사용 가능한 쿠폰 목록
 */
export const getCouponsApi = async (): Promise<AvailableCouponResponse[]> => {
  const response = await getAvailableCoupons();
  // Orval에서 생성된 getCoupons 함수는 Response 타입을 반환하므로,
  // 실제 데이터는 response.data에 있을 것으로 예상합니다.
  // API 응답 구조에 따라 직접 확인이 필요할 수 있습니다.
  // 현재 orval.md에 제시된 패턴을 따릅니다.
  if (response.status !== 200) {
    throw new Error("쿠폰 목록을 불러오는 데 실패했습니다.");
  }
  return response.data;
};

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
 * 모든 쿠폰 목록을 조회합니다
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
 * 특정 쿠폰 정보를 조회합니다
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
 * 새로운 쿠폰을 생성하는 뮤테이션
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
 * 쿠폰을 비활성화하는 뮤테이션
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
 * 쿠폰을 수정하는 뮤테이션
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

// Re-export types
export type { CouponResponse, CouponCreateRequest, CouponUpdateRequest };
