import { useMutation } from "@tanstack/react-query";
import { completePayment } from "@/shared/api/orval/payment/payment";
import type { PaymentCompleteRequest } from "@/shared/api/orval/types";

/**
 * 결제 승인 Mutation
 */
export const useCompletePayment = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: PaymentCompleteRequest;
    }) => completePayment(id, data),
  });
};
