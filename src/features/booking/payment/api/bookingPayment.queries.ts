import { useMutation, useQuery } from "@tanstack/react-query";
import { confirmBooking } from "@/shared/api/orval/booking/booking";
import { createPayment } from "@/shared/api/orval/payment/payment";
import { getSchedule } from "@/shared/api/orval/schedule/schedule";
import type {
  AvailableScheduleResponse,
  BookingResponse,
  PaymentCreateRequest,
  PaymentResponse,
} from "@/shared/api/orval/types";

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

/**
 * 결제 요청을 생성하는 mutation
 * @returns 결제 생성 mutation
 */
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (
      request: PaymentCreateRequest,
    ): Promise<PaymentResponse> => {
      const response = await createPayment(request);
      return response.data as PaymentResponse;
    },
  });
};

/**
 * 예매를 최종 확정하는 mutation
 * @returns 예매 확정 mutation
 */
export const useConfirmBooking = () => {
  return useMutation({
    mutationFn: async (bookingId: string): Promise<BookingResponse> => {
      const response = await confirmBooking(bookingId);
      return response.data as BookingResponse;
    },
  });
};
