/**
 * 공연 홈 태그 관련 React Query 훅들
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPerformanceHomeTag,
  deletePerformanceHomeTag,
  getPerformanceHomeTags,
} from "./performance-home-tag.api";
import { PERFORMANCE_QUERY_KEYS } from "./performance.queries";
import type { AddHomeTagRequest } from "@/shared/api/orval/types";

/**
 * 공연 홈 태그 쿼리 키 상수
 */
export const PERFORMANCE_HOME_TAG_QUERY_KEYS = {
  all: ["performanceHomeTags"] as const,
  lists: () => [...PERFORMANCE_HOME_TAG_QUERY_KEYS.all, "list"] as const,
  list: (performanceId: number) =>
    [...PERFORMANCE_HOME_TAG_QUERY_KEYS.lists(), performanceId] as const,
};

/**
 * 공연의 홈 태그 목록을 조회하는 훅
 * @param performanceId - 공연 ID
 * @param options - useQuery 추가 옵션
 */
export const usePerformanceHomeTags = (
  performanceId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: PERFORMANCE_HOME_TAG_QUERY_KEYS.list(performanceId),
    queryFn: () => getPerformanceHomeTags(performanceId),
    ...options,
  });
};

/**
 * 공연에 홈 태그를 추가하는 뮤테이션 훅
 */
export const useAddPerformanceHomeTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      performanceId,
      request,
    }: {
      performanceId: number;
      request: AddHomeTagRequest;
    }) => addPerformanceHomeTag(performanceId, request),
    onSuccess: (_, { performanceId }) => {
      // 공연 홈 태그 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_HOME_TAG_QUERY_KEYS.list(performanceId),
      });
      // 공연 상세 정보도 무효화 (태그 정보가 포함될 수 있음)
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
      });
    },
  });
};

/**
 * 공연의 홈 태그를 삭제하는 뮤테이션 훅
 */
export const useDeletePerformanceHomeTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      performanceId,
      tag,
    }: {
      performanceId: number;
      tag: string;
    }) => deletePerformanceHomeTag(performanceId, tag),
    onSuccess: (_, { performanceId }) => {
      // 공연 홈 태그 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_HOME_TAG_QUERY_KEYS.list(performanceId),
      });
      // 공연 상세 정보도 무효화
      queryClient.invalidateQueries({
        queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
      });
    },
  });
};
