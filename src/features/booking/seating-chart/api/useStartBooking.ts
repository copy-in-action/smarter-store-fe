/**
 * 예매 시작 (좌석 점유) API Hook
 */
import { useMutation } from "@tanstack/react-query";
import { startBooking } from "@/shared/api/orval/booking/booking";
import type { StartBookingRequest } from "@/shared/api/orval/types";

/**
 * 예매 시작 mutation hook
 * - 선택된 좌석을 서버에 점유 요청
 * - 성공 시 BookingResponse 반환 (bookingId 포함)
 * @returns useMutation hook
 */
export const useStartBooking = () => {
  return useMutation({
    mutationFn: async (request: StartBookingRequest) => {
      const response = await startBooking(request);

      if (response.status !== 200) {
        throw new Error(response.data.message || "좌석 점유에 실패했습니다.");
      }

      return response.data;
    },
  });
};
