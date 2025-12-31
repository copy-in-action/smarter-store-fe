/**
 * 공연장 API 함수들 (React Query 연동)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVenue,
  deleteVenue,
  updateVenue,
} from "@/shared/api/orval/admin-venue/admin-venue";
import type {
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueResponse,
} from "@/shared/api/orval/types";
import { getAllVenues, getVenue } from "@/shared/api/orval/venue/venue";

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
      return response.data as VenueResponse;
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

/**
 * 공연장 수정 뮤테이션 훅
 */
export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVenueRequest;
    }) => {
      const response = await updateVenue(id, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // 공연장 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.lists() });
      // 수정된 공연장의 상세 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.detail(id) });
    },
  });
};

/**
 * 공연장 삭제 뮤테이션 훅
 */
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueId: number) => {
      const response = await deleteVenue(venueId);
      return response.data;
    },
    onSuccess: (_, venueId) => {
      // 공연장 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEYS.lists() });
      // 삭제된 공연장의 상세 쿼리도 무효화
      queryClient.removeQueries({ queryKey: VENUE_QUERY_KEYS.detail(venueId) });
    },
  });
};
