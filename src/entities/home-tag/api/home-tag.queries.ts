/**
 * 홈 태그 관련 React Query 훅들
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateDisplayOrderRequest } from "@/shared/api/orval/types";
import { getPerformancesByTag, updatePerformanceOrder } from "./home-tag.api";

/**
 * 홈 태그 쿼리 키 상수
 */
export const HOME_TAG_QUERY_KEYS = {
  all: ["homeTags"] as const,
  performances: () => [...HOME_TAG_QUERY_KEYS.all, "performances"] as const,
  performancesByTag: (tag: string) =>
    [...HOME_TAG_QUERY_KEYS.performances(), tag] as const,
};

/**
 * 태그별 공연 목록을 조회하는 훅
 * @param tag - 태그 코드
 * @param options - useQuery 추가 옵션
 */
export const usePerformancesByTag = (
  tag: string | null,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: HOME_TAG_QUERY_KEYS.performancesByTag(tag || ""),
    queryFn: () => getPerformancesByTag(tag!),
    enabled: !!tag && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 방지
  });
};

/**
 * 태그 내 공연 순서를 변경하는 뮤테이션 훅
 */
export const useUpdatePerformanceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tag,
      request,
    }: {
      tag: string;
      request: UpdateDisplayOrderRequest;
    }) => updatePerformanceOrder(tag, request),
    onSuccess: (_, { tag }) => {
      // 해당 태그의 공연 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: HOME_TAG_QUERY_KEYS.performancesByTag(tag),
      });
    },
  });
};
