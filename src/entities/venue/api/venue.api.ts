/**
 * 공연장 API 함수들 (React Query 연동)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateVenueRequest } from "@/shared/api/orval/types";
import {
  createVenue,
  getAllVenues,
  getVenue,
} from "@/shared/api/orval/venues/venues";

/**
 * 공연장 쿼리 키 상수
 */
export const VENUE_QUERY_KEYS = {
  all: ["venues"] as const,
  lists: () => [...VENUE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...VENUE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VENUE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...VENUE_QUERY_KEYS.details(), id] as const,
};

/**
 * 모든 공연장 목록을 조회하는 훅
 */
export const useVenues = () => {
  return useQuery({
    queryKey: VENUE_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await getAllVenues();
      return response.data;
    },
  });
};

/**
 * 특정 공연장 정보를 조회하는 훅
 * @param id - 공연장 ID
 */
export const useVenue = (id: number) => {
  return useQuery({
    queryKey: VENUE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await getVenue(id);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * 공연장 생성 뮤테이션 훅
 */
export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueData: CreateVenueRequest) => {
      const response = await createVenue(venueData);
      return response.data;
    },
    onSuccess: () => {
      // 공연장 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.lists() });
    },
  });
};
