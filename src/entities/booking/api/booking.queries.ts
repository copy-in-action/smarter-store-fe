import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type BookingDetailResponse,
  type BookingHistoryResponse,
  cancelBooking,
  getBookingDetail,
  getMyBookings,
} from "./booking.api";

/**
 * 예매 쿼리 키
 */
export const bookingQueryKeys = {
  /** 전체 예매 관련 쿼리 */
  all: ["bookings"] as const,
  /** 내 예매 목록 쿼리 */
  my: () => [...bookingQueryKeys.all, "my"] as const,
  /** 예매 상세 목록 쿼리 */
  details: () => [...bookingQueryKeys.all, "detail"] as const,
  /** 특정 예매 상세 쿼리 */
  detail: (bookingId: string) =>
    [...bookingQueryKeys.details(), bookingId] as const,
};

/**
 * 내 예매 내역 목록을 조회합니다
 * @returns 예매 내역 목록 쿼리
 */
export function useMyBookingsQuery() {
  return useQuery({
    queryKey: bookingQueryKeys.my(),
    queryFn: async (): Promise<BookingHistoryResponse[]> => {
      const response = await getMyBookings();
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("예매 내역 조회에 실패했습니다");
    },
  });
}

/**
 * 특정 예매 상세 정보를 조회합니다
 * @param bookingId - 예매 ID
 * @returns 예매 상세 정보 쿼리
 */
export function useBookingDetailQuery(bookingId: string) {
  return useQuery({
    queryKey: bookingQueryKeys.detail(bookingId),
    queryFn: async (): Promise<BookingDetailResponse> => {
      const response = await getBookingDetail(bookingId);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("예매 상세 조회에 실패했습니다");
    },
    enabled: !!bookingId,
  });
}

/**
 * 예매를 취소하는 뮤테이션
 * @returns 예매 취소 뮤테이션
 */
export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string): Promise<void> => {
      const response = await cancelBooking(bookingId);
      if (response.status === 200) {
        return;
      }
      throw new Error("예매 취소에 실패했습니다");
    },
    onSuccess: (_, bookingId) => {
      // 예매 내역 목록 및 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.my() });
      queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.detail(bookingId),
      });
    },
  });
}
