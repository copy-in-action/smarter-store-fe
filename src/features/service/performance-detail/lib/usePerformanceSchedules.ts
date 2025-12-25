/**
 * 공연하는 날들 조회를 위한 React Query 훅
 */

import { useQuery } from "@tanstack/react-query";
import {
  getAvailableScheduleDates,
  getAvailableSchedulesByDate,
} from "@/shared/api/orval/performance/performance";
import type { AvailableScheduleResponse } from "@/shared/api/orval/types";

/**
 * 공연하는 날들 목록을 조회하는 쿼리
 * @param performanceId - 공연 ID
 * @param enabled - 쿼리 활성화 여부
 */
export const usePerformanceDates = (
  performanceId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["performance-dates", performanceId],
    queryFn: async () => {
      const response = await getAvailableScheduleDates(performanceId);
      return response.data as string[];
    },
    enabled: enabled && !!performanceId,
  });
};

/**
 * 특정 날짜의 공연 스케줄들을 조회하는 쿼리
 * @param performanceId - 공연 ID
 * @param selectedDate - 선택된 날짜
 * @param enabled - 쿼리 활성화 여부
 */
export const usePerformancesByDate = (
  performanceId: number,
  selectedDate: Date,
  enabled: boolean = true,
) => {
  // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
  const dateString = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : undefined;

  return useQuery({
    queryKey: ["performances-by-date", performanceId, dateString],
    queryFn: async () => {
      const response = await getAvailableSchedulesByDate(performanceId, {
        date: dateString!,
      });
      return response.data as AvailableScheduleResponse[];
    },
    enabled: enabled && !!dateString,
    staleTime: 0,
  });
};
