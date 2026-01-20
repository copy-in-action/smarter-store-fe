/**
 * 결제 폼 스키마
 * @module features/service/booking-payment/model
 */

import { z } from "zod";

/**
 * 결제 폼 스키마
 * - 예약자 정보 (성명, 이메일, 휴대폰)
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
    paymentMethod: z.enum([
      "VIRTUAL_ACCOUNT",
      "CREDIT_CARD",
      "KAKAO_PAY",
      "TOSS_PAY",
    ]),
    /** 무통장 입금 은행 코드 */
    bankCode: z.string().optional(),
    /** 예약자 정보 */
    reserverInfo: z.object({
      /** 예약자명 */
      name: z.string().min(1, "예약자명을 입력해주세요"),
      /** 이메일 (UI에서 수정 불가 처리 필요) */
      email: z.email("유효한 이메일 주소를 입력해주세요"),
      /** 휴대폰 번호 */
      phone: z
        .string()
        .min(1, "휴대폰 번호를 입력해주세요")
        .regex(
          /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/,
          "유효한 휴대폰 번호를 입력해주세요",
        ),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "VIRTUAL_ACCOUNT" && !data.bankCode) {
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
