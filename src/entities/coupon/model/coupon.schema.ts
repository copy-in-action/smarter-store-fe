import { z } from "zod";

/**
 * 쿠폰 생성 요청 스키마 (Orval CouponCreateRequest 기반)
 *
 * ⚠️ 중요: src/shared/api/orval/types/couponCreateRequest.ts와 필드가 정확히 일치합니다.
 * Orval 타입: { name: string, discountRate: number, validFrom: string, validUntil: string, sortOrder: number }
 * ⚠️ isActive는 생성 시 서버에서 기본값(true)으로 설정되므로 포함하지 않음
 */
export const createCouponSchema = z.object({
  /** 쿠폰명 */
  name: z.string().min(1, "쿠폰명을 입력해주세요"),
  /**
   * 할인율 (%)
   * @minimum 1
   */
  discountRate: z.number().min(1, "할인율은 1% 이상이어야 합니다"),
  /** 유효 시작일 */
  validFrom: z.string().min(1, "유효 시작일을 입력해주세요"),
  /** 유효 종료일 */
  validUntil: z.string().min(1, "유효 종료일을 입력해주세요"),
  /** 정렬 순서 (낮을수록 먼저 표시) */
  sortOrder: z.number().int("정렬 순서는 정수여야 합니다"),
});

/**
 * 쿠폰 수정 요청 스키마 (Orval CouponUpdateRequest 기반)
 * ⚠️ 수정 시에는 모든 필드가 선택적(optional)
 */
export const updateCouponSchema = z.object({
  /** 쿠폰명 */
  name: z.string().min(1, "쿠폰명을 입력해주세요").optional(),
  /**
   * 할인율 (%)
   * @minimum 1
   */
  discountRate: z.number().min(1, "할인율은 1% 이상이어야 합니다").optional(),
  /** 유효 시작일 */
  validFrom: z.string().min(1, "유효 시작일을 입력해주세요").optional(),
  /** 유효 종료일 */
  validUntil: z.string().min(1, "유효 종료일을 입력해주세요").optional(),
  /** 활성화 여부 */
  isActive: z.boolean().optional(),
  /** 정렬 순서 (낮을수록 먼저 표시) */
  sortOrder: z.number().int("정렬 순서는 정수여야 합니다").optional(),
});

/**
 * 쿠폰 생성 폼 타입
 */
export type CreateCouponForm = z.infer<typeof createCouponSchema>;

/**
 * 쿠폰 수정 폼 타입
 */
export type UpdateCouponForm = z.infer<typeof updateCouponSchema>;
