"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  autocomplete,
  search,
} from "@/shared/api/orval/performance-search/performance-search";
import type {
  AutocompleteParams,
  SearchParams,
} from "@/shared/api/orval/types";

/**
 * 자동완성 검색 Query Hook
 * - 검색어 입력 시 최대 6개의 관련 공연을 추천
 * @param keyword - 검색 키워드
 * @returns 자동완성 검색 결과 Query
 */
export const useAutocompleteQuery = (keyword?: string) => {
  return useQuery({
    queryKey: ["performance", "autocomplete", keyword],
    queryFn: async () => {
      const params: AutocompleteParams = { keyword };
      const response = await autocomplete(params);
      return response.data;
    },
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 공연 검색 Query Hook (일반)
 * @param params - 검색 파라미터
 * @returns 검색 결과 Query
 */
export const useSearchQuery = (params: SearchParams) => {
  return useQuery({
    queryKey: ["performance", "search", params],
    queryFn: async () => {
      const response = await search(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 공연 검색 Infinite Query Hook (무한 스크롤용)
 * @param baseParams - 기본 검색 파라미터 (page, size 제외)
 * @returns 무한 스크롤 검색 결과 Query
 */
export const useSearchInfiniteQuery = (
  baseParams: Omit<SearchParams, "page" | "size">,
) => {
  return useInfiniteQuery({
    queryKey: ["performance", "search", "infinite", baseParams],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await search({
        ...baseParams,
        page: pageParam,
        size: 20,
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
