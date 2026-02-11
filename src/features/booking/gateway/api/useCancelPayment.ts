import { useMutation } from "@tanstack/react-query";
import { cancelBooking } from "@/shared/api/orval/booking/booking";

/**
 * 결제 취소 Mutation
 */
export const useCancelPayment = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => cancelBooking(id),
  });
};
