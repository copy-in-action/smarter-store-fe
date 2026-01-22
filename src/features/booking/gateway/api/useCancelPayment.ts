import { useMutation } from "@tanstack/react-query";
import { cancelPayment } from "@/shared/api/orval/payment/payment";
import type { PaymentCancelRequest } from "@/shared/api/orval/types";

/**
 * 결제 취소 Mutation
 */
export const useCancelPayment = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: PaymentCancelRequest;
    }) => cancelPayment(id, data),
  });
};
