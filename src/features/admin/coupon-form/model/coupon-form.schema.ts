import { z } from "zod";
import { createCouponSchema } from "@/entities/coupon";

/**
 * 쿠폰 생성 폼 스키마 (Entity 상속 + 날짜 검증)
 * ⚠️ transform 제거: UI 상태 값과 입력 값 불일치 방지
 * 데이터 변환은 onSubmit 내부에서 dirtyFields를 활용해 처리
 */
export const createCouponFormSchema = createCouponSchema
  .extend({
    /** 할인율 (숫자) */
    discountRate: z.number().min(1, "할인율을 입력해주세요"),
    /** 유효 시작일 (YYYY-MM-DD 형식) */
    validFrom: z.string().min(1, "유효 시작일을 입력해주세요"),
    /** 유효 종료일 (YYYY-MM-DD 형식) */
    validUntil: z.string().min(1, "유효 종료일을 입력해주세요"),
  })
  .refine(
    (data) => {
      // 종료일이 시작일보다 늦어야 함
      if (data.validFrom && data.validUntil) {
        return new Date(data.validFrom) <= new Date(data.validUntil);
      }
      return true;
    },
    { message: "종료일은 시작일보다 늦어야 합니다", path: ["validUntil"] },
  );

/**
 * 쿠폰 수정 폼 스키마 (isActive 포함)
 */
export const updateCouponFormSchema = createCouponFormSchema
  .safeExtend({
    /** 활성화 여부 */
    isActive: z.boolean().optional(),
  })
  .partial();

/**
 * 쿠폰 생성 폼 타입
 */
export type CreateCouponFormInput = z.infer<typeof createCouponFormSchema>;

/**
 * 쿠폰 수정 폼 타입
 */
export type UpdateCouponFormInput = z.infer<typeof updateCouponFormSchema>;

// 호환성 유지
export const couponFormSchema = createCouponFormSchema;
export type CouponFormInput = CreateCouponFormInput;
