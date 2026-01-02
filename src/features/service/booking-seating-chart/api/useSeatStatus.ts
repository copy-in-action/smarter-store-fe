/**
 * 회차별 좌석 상태 조회 API Hook
 */
import { useQuery } from "@tanstack/react-query";
import { getSeatStatus } from "@/shared/api/orval/schedule/schedule";

/**
 * 특정 회차의 좌석 상태를 조회하는 쿼리
 * - 점유 중인 좌석(pending)과 예약 완료된 좌석(reserved) 목록 반환
 * @param scheduleId - 회차 ID
 * @param options - React Query 옵션
 * @returns 좌석 상태 데이터
 */
export function useSeatStatus(
  scheduleId: number,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: ["seatStatus", scheduleId],
    queryFn: async () => {
      const response = await getSeatStatus(scheduleId);

      if (response.status !== 200) {
        throw new Error("좌석 상태 조회에 실패했습니다.");
      }

      return response.data;
    },
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}
