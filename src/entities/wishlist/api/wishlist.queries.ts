/**
 * 찜하기 React Query hooks
 */

"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/entities/user/model/user-context";
import type { GetMyWishlistsParams } from "../model/wishlist.types";
import {
  addWishlist,
  checkWishlistStatus,
  getMyWishlists,
  removeWishlist,
} from "./wishlist.api";

/**
 * 찜하기 쿼리 키 팩토리
 */
export const WISHLIST_QUERY_KEYS = {
  all: ["wishlist"] as const,
  status: (performanceId: number) =>
    ["wishlist", "status", performanceId] as const,
  list: () => ["wishlist", "list"] as const,
};

/**
 * 공연 찜 여부 조회 query hook
 * 로그인한 경우에만 API 호출, 비로그인 시 enabled: false
 * @param performanceId - 공연 ID
 */
export function useWishlistStatusQuery(performanceId: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: WISHLIST_QUERY_KEYS.status(performanceId),
    queryFn: async () => {
      const response = await checkWishlistStatus(performanceId);
      return response.data;
    },
    enabled: !!user, // 로그인한 경우에만 쿼리 실행
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 공연 찜하기/취소 mutation hook
 * Optimistic Updates를 통해 즉각적인 UI 반응 제공
 * @param performanceId - 공연 ID
 */
export function useWishlistToggleMutation(performanceId: number) {
  const queryClient = useQueryClient();
  const statusQueryKey = WISHLIST_QUERY_KEYS.status(performanceId);
  const listQueryKey = WISHLIST_QUERY_KEYS.list();

  return useMutation({
    mutationFn: async (isCurrentlyWishlisted: boolean) => {
      if (isCurrentlyWishlisted) {
        return removeWishlist(performanceId);
      }
      return addWishlist(performanceId);
    },

    // 1. 낙관적 업데이트
    onMutate: async (isCurrentlyWishlisted) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: statusQueryKey });

      // 이전 상태 저장 (롤백용)
      const previousStatus = queryClient.getQueryData(statusQueryKey);

      // 즉시 UI 업데이트
      queryClient.setQueryData(statusQueryKey, {
        isWishlisted: !isCurrentlyWishlisted,
      });

      return { previousStatus };
    },

    // 2. 성공 시 toast 메시지
    onSuccess: (data, isCurrentlyWishlisted) => {
      if (isCurrentlyWishlisted) {
        toast.success("찜 목록에서 제거되었습니다");
      } else {
        toast.success("찜 목록에 추가되었습니다");
      }
    },

    // 3. 에러 시 롤백
    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(statusQueryKey, context.previousStatus);
      }
      toast.error("찜하기 처리 중 오류가 발생했습니다");
    },

    // 4. 성공/실패 관계없이 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statusQueryKey });
      queryClient.invalidateQueries({ queryKey: listQueryKey });

      // ❌ 공연 페이지 revalidate는 불필요!
      // 찜 상태는 공연 정보와 분리되어 있으므로
    },
  });
}

/**
 * 찜 목록 무한 스크롤 query hook
 * @param params - 찜 목록 조회 파라미터
 */
export function useWishlistInfiniteQuery(
  params?: Omit<GetMyWishlistsParams, "page">,
) {
  return useInfiniteQuery({
    queryKey: [...WISHLIST_QUERY_KEYS.list(), params],
    queryFn: ({ pageParam = 0 }) =>
      getMyWishlists({
        ...params,
        page: pageParam,
        size: params?.size || 20,
      }).then((res) => res.data),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const meta = lastPage.meta;
      return meta.hasNextPage ? lastPageParam + 1 : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 3, // 3분
  });
}
