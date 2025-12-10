/**
 * 공연장 생성 폼 스키마
 */

import { z } from "zod";

/**
 * 공연장 생성 폼 유효성 검사 스키마
 */
export const venueFormSchema = z.object({
  /**
   * 공연장 이름 (필수, 1-100자)
   */
  name: z
    .string("공연장 이름을 입력해주세요.")
    .min(1, "공연장 이름을 입력해주세요.")
    .max(100, "공연장 이름은 100자 이내로 입력해주세요."),

  /**
   * 공연장 주소 (선택, 최대 255자)
   */
  address: z
    .string()
    .max(255, "주소는 255자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),

  /**
   * 좌석 배치도 URL (선택, URL 형식)
   */
  // TODO: 확인 필요
  seatingChartUrl: z
    .url("올바른 URL 형식을 입력해주세요.")
    .optional()
    .or(z.literal("")),
});

/**
 * 공연장 생성 폼 데이터 타입
 */
export type VenueFormData = z.infer<typeof venueFormSchema>;
