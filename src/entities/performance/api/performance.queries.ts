/**
 * 공연 관련 React Query 훅들
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNewPerformance,
  deleteExistingPerformance,
  getPerformanceDetail,
  getPerformanceList,
  updateExistingPerformance,
} from "@/entities/performance";
import type {
  PerformanceResponse,
  UpdatePerformanceRequest,
} from "@/shared/api/orval/types";
import { revalidatePerformancePages } from "@/shared/lib/revalidate";

/**
 * 공연 쿼리 키 상수
 */
export const PERFORMANCE_QUERY_KEYS = {
  all: ["performances"] as const,
  lists: () => [...PERFORMANCE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...PERFORMANCE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PERFORMANCE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PERFORMANCE_QUERY_KEYS.details(), id] as const,
};

/**
 * 모든 공연 목록을 조회하는 훅
 * @param options - useQuery 추가 옵션
 */
export const usePerformances = (options?: {
  initialData?: PerformanceResponse[];
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.lists(),
    queryFn: getPerformanceList,
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
};

/**
 * 특정 공연 정보를 조회하는 훅
 * @param id - 공연 ID
 * @param options - useQuery 추가 옵션
 */
export const usePerformance = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.detail(id),
    queryFn: () => getPerformanceDetail(id),
    ...options,
  });
};

/**
 * 공연 생성 뮤테이션 훅
 */
export const useCreatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewPerformance,
    onSuccess: async () => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });

      // 홈페이지 캐시 즉시 재생성 (신규 공연 즉시 노출)
      await revalidatePerformancePages();
    },
  });
};

/**
 * 공연 수정 뮤테이션 훅
 */
export const useUpdatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePerformanceRequest;
    }) => updateExistingPerformance(id, data),
    onSuccess: async (_, { id }) => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      // 수정된 공연의 상세 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(id),
      });

      // 홈페이지 캐시 즉시 재생성
      await revalidatePerformancePages();
    },
  });
};

/**
 * 공연 삭제 뮤테이션 훅
 */
export const useDeletePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExistingPerformance,
    onSuccess: async (_, performanceId) => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      // 삭제된 공연의 상세 쿼리도 무효화
      queryClient.removeQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
      });

      // 홈페이지 캐시 즉시 재생성 (삭제된 공연 즉시 제거)
      await revalidatePerformancePages();
    },
  });
};
