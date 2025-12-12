/**
 * 공연 API 함수들 (React Query 연동)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPerformance,
  deletePerformance,
  getAllPerformances,
  getPerformance,
  updatePerformance,
} from "@/shared/api/orval/performances/performances";
import type {
  CreatePerformanceRequest,
  PerformanceResponse,
  UpdatePerformanceRequest,
} from "@/shared/api/orval/types";

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
    queryFn: async () => {
      const response = await getAllPerformances();
      return response.data || [];
    },
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
    queryFn: async () => {
      const response = await getPerformance(id);
      return response.data as PerformanceResponse;
    },
    ...options,
  });
};

/**
 * 공연 생성 뮤테이션 훅
 */
export const useCreatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (performanceData: CreatePerformanceRequest) => {
      const response = await createPerformance(performanceData);
      return response.data;
    },
    onSuccess: () => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * 공연 수정 뮤테이션 훅
 */
export const useUpdatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePerformanceRequest;
    }) => {
      const response = await updatePerformance(id, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      // 수정된 공연의 상세 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(id),
      });
    },
  });
};

/**
 * 공연 삭제 뮤테이션 훅
 */
export const useDeletePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (performanceId: number) => {
      const response = await deletePerformance(performanceId);
      return response.data;
    },
    onSuccess: (_, performanceId) => {
      // 공연 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.lists(),
      });
      // 삭제된 공연의 상세 쿼리도 무효화
      queryClient.removeQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
      });
    },
  });
};
