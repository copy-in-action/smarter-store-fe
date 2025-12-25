/**
 * 공연장 폼 스키마
 */

import { z } from "zod";
import { createVenueSchema } from "@/entities/venue";

/**
 * 공연장 폼 특화 스키마 (entities 상속 + 폼 로직)
 */
export const createVenueFormSchema = createVenueSchema.extend({
  /**
   * 공연장 주소 (빈 문자열 허용)
   */
  address: z
    .string()
    .max(255, "주소는 255자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),

  /**
   * 공연장 대표번호 (빈 문자열 허용)
   */
  phoneNumber: z
    .string()
    .max(50, "전화번호는 50자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),
});

/**
 * 공연장 수정 폼 스키마
 */
export const updateVenueFormSchema = createVenueFormSchema;

/**
 * 공연장 생성 폼 타입 (input과 output 분리)
 */
export type CreateVenueFormInput = z.input<typeof createVenueFormSchema>;
export type CreateVenueFormData = z.output<typeof createVenueFormSchema>;

/**
 * 공연장 수정 폼 타입
 */
export type UpdateVenueFormInput = z.input<typeof updateVenueFormSchema>;
export type UpdateVenueFormData = z.output<typeof updateVenueFormSchema>;

/**
 * 호환성 유지용 스키마 및 타입
 */
export const venueFormSchema = createVenueFormSchema;
export type VenueFormData = CreateVenueFormData;
