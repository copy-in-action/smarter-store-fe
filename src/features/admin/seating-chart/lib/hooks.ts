import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  SeatingChartRequest,
  SeatingChartResponse,
} from "@/shared/api/orval/types";
import { fetchSeatingChart, saveSeatingChart } from "../api/seatingChart.api";

/**
 * 좌석 배치도 조회 쿼리 키
 */
export const seatingChartKeys = {
  /** 모든 좌석 배치도 쿼리 */
  all: ["seating-chart"] as const,
  /** 특정 공연장의 좌석 배치도 */
  byVenue: (venueId: number) => [...seatingChartKeys.all, venueId] as const,
};

/**
 * 좌석 배치도 조회 훅
 * @param venueId - 공연장 ID
 * @param initialData - 서버에서 미리 가져온 초기 데이터
 * @returns 좌석 배치도 데이터와 로딩 상태
 */
export function useSeatingChart(
  venueId: number,
  initialData?: SeatingChartResponse | null,
) {
  return useQuery({
    queryKey: seatingChartKeys.byVenue(venueId),
    queryFn: () => fetchSeatingChart(venueId),
    initialData,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

/**
 * 좌석 배치도 저장 뮤테이션 훅
 * @param venueId - 공연장 ID
 * @returns 저장 뮤테이션 함수와 상태
 */
export function useSaveSeatingChart(venueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SeatingChartRequest) =>
      saveSeatingChart(venueId, request),
    onSuccess: () => {
      toast.success("좌석 배치도가 성공적으로 저장되었습니다");
      // 캐시 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({
        queryKey: seatingChartKeys.byVenue(venueId),
      });
    },
    onError: (error) => {
      console.error("좌석 배치도 저장 실패:", error);
      toast.error("좌석 배치도 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });
}
