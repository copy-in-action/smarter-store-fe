import { useQuery } from "@tanstack/react-query";
import { getAvailableSchedulesByDate } from "@/shared/api/orval/performance/performance";
import type { GetAvailableSchedulesByDateParams } from "@/shared/api/orval/types";

/**
 * 특정 날짜의 예매 가능한 공연 회차를 조회하는 쿼리
 * @param performanceId - 공연 ID  
 * @param params - 조회 파라미터 (날짜)
 * @returns 해당 날짜의 예매 가능한 회차 목록
 */
export function useAvailableSchedulesByDate(
  performanceId: number,
  params: GetAvailableSchedulesByDateParams,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['availableSchedules', performanceId, params.date],
    queryFn: () => getAvailableSchedulesByDate(performanceId, params),
    enabled: options?.enabled,
  });
}