/**
 * 공연장 기본 스키마
 */

import { z } from "zod";

/**
 * 공연장 생성 스키마
 */
export const createVenueSchema = z.object({
  /**
   * 공연장 이름 (필수, 1-100자)
   */
  name: z
    .string()
    .min(1, "공연장 이름을 입력해주세요.")
    .max(100, "공연장 이름은 100자 이내로 입력해주세요."),

  /**
   * 공연장 주소 (선택, 최대 255자)
   */
  address: z
    .string()
    .max(255, "주소는 255자 이내로 입력해주세요.")
    .optional(),

  /**
   * 공연장 대표번호 (선택, 최대 50자)
   */
  phoneNumber: z
    .string()
    .max(50, "전화번호는 50자 이내로 입력해주세요.")
    .optional(),
});

/**
 * 공연장 수정 스키마
 */
export const updateVenueSchema = z.object({
  /**
   * 공연장 이름 (필수, 1-100자)
   */
  name: z
    .string()
    .min(1, "공연장 이름을 입력해주세요.")
    .max(100, "공연장 이름은 100자 이내로 입력해주세요."),

  /**
   * 공연장 주소 (선택, 최대 255자)
   */
  address: z
    .string()
    .max(255, "주소는 255자 이내로 입력해주세요.")
    .optional(),

  /**
   * 공연장 대표번호 (선택, 최대 50자)
   */
  phoneNumber: z
    .string()
    .max(50, "전화번호는 50자 이내로 입력해주세요.")
    .optional(),
});

/**
 * 공연장 생성 폼 타입
 */
export type CreateVenueForm = z.infer<typeof createVenueSchema>;

/**
 * 공연장 수정 폼 타입
 */
export type UpdateVenueForm = z.infer<typeof updateVenueSchema>;