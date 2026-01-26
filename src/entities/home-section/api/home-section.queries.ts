/**
 * 홈 섹션 메타데이터 관련 React Query 훅들
 */

import { useQuery } from "@tanstack/react-query";
import { getHomeSectionsMetadata } from "./home-section.api";

/**
 * 홈 섹션 메타데이터 쿼리 키 상수
 */
export const HOME_SECTION_QUERY_KEYS = {
  all: ["homeSections"] as const,
  metadata: () => [...HOME_SECTION_QUERY_KEYS.all, "metadata"] as const,
};

/**
 * 홈 섹션 메타데이터를 조회하는 훅
 * 모든 섹션과 태그 구조 정보를 가져옴
 * @param options - useQuery 추가 옵션
 */
export const useHomeSectionsMetadata = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: HOME_SECTION_QUERY_KEYS.metadata(),
    queryFn: getHomeSectionsMetadata,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (메타데이터는 자주 변경되지 않음)
    ...options,
  });
};
