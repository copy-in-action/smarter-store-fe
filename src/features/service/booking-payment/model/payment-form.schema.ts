/**
 * 결제 폼 스키마
 * @module features/service/booking-payment/model
 */

import { z } from "zod";

/**
 * 결제 폼 스키마
 * - 약관 동의 필수
 * - 결제 수단 선택 필수
 * - 무통장 입금 선택 시 은행 코드 필수
 */
export const paymentFormSchema = z
  .object({
    /** 약관 동의 여부 */
    isAgreed: z.boolean().refine((val) => val === true, {
      message: "약관에 동의해주세요",
    }),
    /** 결제 수단 */
    paymentMethod: z.enum(["CREDIT_CARD", "KAKAO_PAY", "TOSS_PAY"]),
    /** 무통장 입금 은행 코드 */
    bankCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "CREDIT_CARD" && !data.bankCode) {
      ctx.addIssue({
        code: "custom",
        message: "은행을 선택해주세요",
        path: ["bankCode"],
      });
    }
  });

/**
 * 결제 폼 데이터 타입
 */
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
