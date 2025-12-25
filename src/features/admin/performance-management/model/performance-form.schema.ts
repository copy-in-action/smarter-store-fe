/**
 * 공연 폼 관련 Zod 스키마 정의
 */

import { z } from "zod";
import {
  createPerformanceSchema,
  updatePerformanceSchema,
} from "@/entities/performance/model/performance.schema";

/**
 * 공연 생성 폼 데이터 스키마 (entities 기반)
 */
export const createPerformanceFormSchema = createPerformanceSchema
  .extend({
    /** 공연 시간 - 폼에서는 문자열로 입력받아 숫자로 변환 */
    runningTime: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 공연장 ID - 폼에서는 문자열로 받아서 숫자로 변환 */
    venueId: z
      .string()
      .min(1, "공연장을 선택해주세요")
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !Number.isNaN(val) && val > 0,
        "유효한 공연장을 선택해주세요",
      )
      .optional(),

    /** 판매자 ID - 폼에서는 문자열로 받아서 숫자로 변환 */
    companyId: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 예매 수수료 - 폼에서는 문자열로 받아서 숫자로 변환 */
    bookingFee: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
      }),
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
 * 공연 수정 폼 데이터 스키마 (entities 기반)
 */
export const updatePerformanceFormSchema = updatePerformanceSchema
  .extend({
    /** 공연 시간 - 폼에서는 문자열로 입력받아 숫자로 변환 */
    runningTime: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 공연장 ID - 폼에서는 문자열로 받아서 숫자로 변환 */
    venueId: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 판매자 ID - 폼에서는 문자열로 받아서 숫자로 변환 */
    companyId: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Number.isNaN(num) ? undefined : num;
      }),

    /** 예매 수수료 - 폼에서는 문자열로 받아서 숫자로 변환 */
    bookingFee: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
      }),
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
 * 기존 호환성을 위한 별칭
 */
export const performanceFormSchema = createPerformanceFormSchema;

/**
 * 폼 입력 데이터 타입 (유저가 입력하는 원본 데이터)
 */
export type CreatePerformanceFormInput = z.input<
  typeof createPerformanceFormSchema
>;
export type UpdatePerformanceFormInput = z.input<
  typeof updatePerformanceFormSchema
>;

/**
 * 최종 변환된 데이터 타입 (서버 전송용)
 */
export type CreatePerformanceFormData = z.output<
  typeof createPerformanceFormSchema
>;
export type UpdatePerformanceFormData = z.output<
  typeof updatePerformanceFormSchema
>;

/**
 * 기존 호환성을 위한 별칭
 */
export type PerformanceFormInput = CreatePerformanceFormInput;
export type PerformanceFormData = CreatePerformanceFormData;

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
export function createFormDefaultValues(): CreatePerformanceFormInput {
  return {
    title: "",
    description: "",
    category: "",
    runningTime: "",
    ageRating: "",
    mainImageUrl: "",
    visible: false,
    venueId: "",
    startDate: "",
    endDate: "",
    actors: "",
    agency: "",
    producer: "",
    host: "",
    discountInfo: "",
    usageGuide: "",
    refundPolicy: "",
    detailImageUrl: "",
    companyId: "",
    bookingFee: "",
    shippingGuide: "",
  };
}
