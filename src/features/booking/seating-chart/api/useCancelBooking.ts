/**
 * 예매 취소 (좌석 점유 해제) API Hook
 */
import { useMutation } from "@tanstack/react-query";
import { cancelBooking } from "@/shared/api/orval/booking/booking";

/**
 * 예매 취소 mutation hook
 * - 점유된 좌석을 해제
 * @returns useMutation hook
 */
export const useCancelBooking = () => {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await cancelBooking(bookingId);

      if (response.status !== 200) {
        throw new Error(response.data.message || "예매 취소에 실패했습니다.");
      }

      return response.data;
    },
  });
};
