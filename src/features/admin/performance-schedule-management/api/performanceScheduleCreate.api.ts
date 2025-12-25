import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSchedule } from "@/shared/api/orval/performance-schedule/performance-schedule";
import type { CreatePerformanceScheduleRequest } from "@/shared/api/orval/types";

/**
 * 공연 회차 생성 뮤테이션 훅
 */
export const useCreatePerformanceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      performanceId, 
      data 
    }: {
      performanceId: number;
      data: CreatePerformanceScheduleRequest;
    }) => {
      const response = await createSchedule(performanceId, data);
      return response.data;
    },
    onSuccess: (_, { performanceId }) => {
      // 공연 회차 목록 쿼리 무효화하여 리스트 갱신
      queryClient.invalidateQueries({
        queryKey: ["performance-schedules", performanceId],
      });
    },
  });
};