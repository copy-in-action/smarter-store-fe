import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSchedule,
  deleteSchedule,
  getAllSchedules,
  getSchedule,
  updateSchedule,
} from "@/shared/api/orval/performance-schedule/performance-schedule";
import type {
  CreatePerformanceScheduleRequest,
  PerformanceScheduleResponse,
} from "@/shared/api/orval/types";
import type { PerformanceScheduleFormData } from "../model/performance-schedule-form.schema";

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
 * 특정 공연 회차의 상세 정보를 조회하는 쿼리
 * @param scheduleId - 회차 ID
 */
export const useGetPerformanceSchedule = (scheduleId: number) => {
  return useQuery({
    queryKey: ["performance-schedule", scheduleId],
    queryFn: async (): Promise<PerformanceScheduleResponse> => {
      const response = await getSchedule(scheduleId);
      return response.data;
    },
    enabled: !!scheduleId,
  });
};

/**
 * 공연 회차 생성 뮤테이션 훅
 */
export const useCreatePerformanceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      performanceId,
      data,
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

/**
 * 공연 회차 수정을 위한 뮤테이션 매개변수
 */
interface UpdatePerformanceScheduleParams {
  /** 회차 ID */
  scheduleId: number;
  /** 수정할 데이터 */
  data: PerformanceScheduleFormData;
}

/**
 * 공연 회차를 수정하는 뮤테이션
 */
export const useUpdatePerformanceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      data,
    }: UpdatePerformanceScheduleParams): Promise<void> => {
      await updateSchedule(scheduleId, data);
    },
    onSuccess: (_, { scheduleId }) => {
      // 관련된 쿼리들을 무효화하여 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["performance-schedule", scheduleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["performance-schedules"],
      });
    },
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
