/**
 * 공연 폼 관련 Zod 스키마 정의
 */

import { z } from "zod";

/**
 * 공연 폼 데이터 스키마
 */
export const performanceFormSchema = z
  .object({
    /** 공연명 */
    title: z
      .string()
      .min(1, "공연명을 입력해주세요")
      .max(100, "공연명은 100자 이하로 입력해주세요"),

    /** 공연 상세 설명 */
    description: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),

    /** 공연 카테고리 */
    category: z.string().min(1, "카테고리를 선택해주세요"),

    /** 공연 시간 (분) - 문자열로 입력받아 숫자로 변환 */
    runningTime: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 공연 관람 연령 */
    ageRating: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),

    /** 공연 대표 이미지 URL */
    mainImageUrl: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined)
      .refine(
        (val) => {
          if (!val) return true;
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: "올바른 URL 형식을 입력해주세요",
        },
      ),

    /** 공연 노출 여부 */
    visible: z.boolean(),

    /** 공연장 ID */
    venueId: z.number().min(1, "공연장을 선택해주세요"),

    /** 공연 시작일 */
    startDate: z
      .string()
      .min(1, "시작일을 입력해주세요")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요",
      ),

    /** 공연 종료일 */
    endDate: z
      .string()
      .min(1, "종료일을 입력해주세요")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요",
      ),
  })
  .refine(
    (data) => {
      // 시작일과 종료일 비교
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "종료일은 시작일보다 늦어야 합니다",
      path: ["endDate"],
    },
  );

/**
 * 폼 입력 데이터 타입 (유저가 입력하는 원본 데이터)
 */
export type PerformanceFormInput = z.input<typeof performanceFormSchema>;

/**
 * 최종 변환된 데이터 타입 (서버 전송용)
 */
export type PerformanceFormData = z.output<typeof performanceFormSchema>;

/**
 * 공연 카테고리 옵션
 */
export const PERFORMANCE_CATEGORIES = [
  { value: "뮤지컬", label: "뮤지컬" },
  { value: "콘서트", label: "콘서트" },
  { value: "연극", label: "연극" },
  { value: "전시/행사", label: "전시/행사" },
  { value: "클래식/무용", label: "클래식/무용" },
  { value: "아동/가족", label: "아동/가족" },
] as const;

/**
 * 공연 관람 연령 옵션
 */
export const AGE_RATING_OPTIONS = [
  { value: "전체이용가", label: "전체이용가" },
  { value: "7세이상", label: "7세 이상" },
  { value: "12세이상", label: "12세 이상" },
  { value: "15세이상", label: "15세 이상" },
  { value: "19세이상", label: "19세 이상" },
] as const;

/**
 * 기본값 생성 함수 (빈 폼용)
 * @returns 폼 기본값
 */
export function createFormDefaultValues(): PerformanceFormInput {
  return {
    title: "",
    description: "",
    category: "",
    runningTime: "",
    ageRating: "",
    mainImageUrl: "",
    visible: true,
    venueId: 0,
    startDate: "",
    endDate: "",
  };
}
