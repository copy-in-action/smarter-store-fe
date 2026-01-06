import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "@/shared/api/orval/schedule/schedule";
import type { AvailableScheduleResponse } from "@/shared/api/orval/types";

/**
 * 특정 공연 회차의 상세 정보를 조회하는 쿼리
 * @param scheduleId - 회차 ID
 */
export const useGetPerformanceSchedule = (scheduleId: number) => {
  return useQuery({
    queryKey: ["performance-schedule", scheduleId],
    queryFn: async (): Promise<AvailableScheduleResponse> => {
      const response = await getSchedule(scheduleId);
      return response.data as AvailableScheduleResponse;
    },
    enabled: !!scheduleId,
  });
};
