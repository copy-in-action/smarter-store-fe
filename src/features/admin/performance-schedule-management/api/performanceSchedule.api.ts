import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSchedule,
  getAllSchedules,
} from "@/shared/api/orval/performance-schedule/performance-schedule";
import type { PerformanceScheduleResponse } from "@/shared/api/orval/types";

/**
 * 특정 공연의 모든 회차 목록을 조회하는 쿼리
 * @param performanceId - 공연 ID
 */
export const useGetPerformanceSchedules = (performanceId: number) => {
  return useQuery({
    queryKey: ["performance-schedules", performanceId],
    queryFn: async (): Promise<PerformanceScheduleResponse[]> => {
      const response = await getAllSchedules(performanceId);
      return response.data;
    },
    enabled: !!performanceId,
  });
};

/**
 * 공연 회차를 삭제하는 뮤테이션
 */
export const useDeletePerformanceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: number): Promise<void> => {
      await deleteSchedule(scheduleId);
    },
    onSuccess: (_, scheduleId) => {
      // 관련된 쿼리들을 무효화하여 리스트 갱신
      queryClient.invalidateQueries({
        queryKey: ["performance-schedules"],
      });
    },
  });
};
