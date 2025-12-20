/**
 * 공연 관련 Zod 스키마 정의
 */

import { z } from "zod";

/**
 * 공연 생성 요청 스키마
 */
export const createPerformanceSchema = z.object({
  /** 공연명 */
  title: z
    .string()
    .min(1, "공연명을 입력해주세요")
    .max(255, "공연명은 255자를 초과할 수 없습니다"),
  /** 공연 상세 설명 */
  description: z.string().optional(),
  /** 공연 카테고리 */
  category: z.string().min(1, "카테고리를 선택해주세요"),
  /** 공연 시간 (분) */
  runningTime: z.number().positive("공연 시간은 양수여야 합니다").optional(),
  /** 공연 관람 연령 */
  ageRating: z.string().optional(),
  /** 공연 대표 이미지 URL */
  mainImageUrl: z.string().url("올바른 URL을 입력해주세요").optional(),
  /** 공연 노출 여부 */
  visible: z.boolean().default(true),
  /** 공연장 ID */
  venueId: z.number().positive("공연장을 선택해주세요").optional(),
  /** 공연 시작일 */
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  /** 공연 종료일 */
  endDate: z.string().min(1, "종료일을 입력해주세요"),
  /** 출연진 */
  actors: z.string().optional(),
  /** 판매자 */
  agency: z
    .string()
    .max(255, "판매자명은 255자를 초과할 수 없습니다")
    .optional(),
  /** 제작사 */
  producer: z
    .string()
    .max(255, "제작사명은 255자를 초과할 수 없습니다")
    .optional(),
  /** 주최 */
  host: z.string().max(255, "주최명은 255자를 초과할 수 없습니다").optional(),
  /** 할인정보 */
  discountInfo: z.string().optional(),
  /** 이용안내 */
  usageGuide: z.string().optional(),
  /** 취소/환불규정 */
  refundPolicy: z.string().optional(),
  /** 상품상세 이미지 URL */
  detailImageUrl: z
    .string()
    .max(500, "상품상세 이미지 URL은 500자를 초과할 수 없습니다")
    .optional(),
  /** 판매자/판매자 ID */
  companyId: z.number().positive("판매자를 선택해주세요").optional(),
  /** 예매 수수료 */
  bookingFee: z.number().min(0, "예매 수수료는 0 이상이어야 합니다").optional(),
  /** 배송 안내 */
  shippingGuide: z.string().optional(),
});

/**
 * 공연 수정 요청 스키마
 */
export const updatePerformanceSchema = z.object({
  /** 공연명 */
  title: z
    .string()
    .min(1, "공연명을 입력해주세요")
    .max(255, "공연명은 255자를 초과할 수 없습니다"),
  /** 공연 상세 설명 */
  description: z.string().optional(),
  /** 공연 카테고리 */
  category: z.string().min(1, "카테고리를 선택해주세요"),
  /** 공연 시간 (분) */
  runningTime: z.number().positive("공연 시간은 양수여야 합니다").optional(),
  /** 공연 관람 연령 */
  ageRating: z.string().optional(),
  /** 공연 대표 이미지 URL */
  mainImageUrl: z.string().url("올바른 URL을 입력해주세요").optional(),
  /** 공연 노출 여부 */
  visible: z.boolean(),
  /** 공연장 ID */
  venueId: z.number().positive("공연장을 선택해주세요").optional(),
  /** 공연 시작일 */
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  /** 공연 종료일 */
  endDate: z.string().min(1, "종료일을 입력해주세요"),
  /** 출연진 */
  actors: z.string().optional(),
  /** 판매자 */
  agency: z
    .string()
    .max(255, "판매자명은 255자를 초과할 수 없습니다")
    .optional(),
  /** 제작사 */
  producer: z
    .string()
    .max(255, "제작사명은 255자를 초과할 수 없습니다")
    .optional(),
  /** 주최 */
  host: z.string().max(255, "주최명은 255자를 초과할 수 없습니다").optional(),
  /** 할인정보 */
  discountInfo: z.string().optional(),
  /** 이용안내 */
  usageGuide: z.string().optional(),
  /** 취소/환불규정 */
  refundPolicy: z.string().optional(),
  /** 상품상세 이미지 URL */
  detailImageUrl: z
    .string()
    .max(500, "상품상세 이미지 URL은 500자를 초과할 수 없습니다")
    .optional(),
  /** 판매자/판매자 ID */
  companyId: z.number().positive("판매자를 선택해주세요").optional(),
  /** 예매 수수료 */
  bookingFee: z.number().min(0, "예매 수수료는 0 이상이어야 합니다").optional(),
  /** 배송 안내 */
  shippingGuide: z.string().optional(),
});

/**
 * 공연 필터 스키마
 */
export const performanceFilterSchema = z.object({
  /** 공연명으로 검색 */
  title: z.string().optional(),
  /** 카테고리 필터 */
  category: z.string().optional(),
  /** 공연장 ID 필터 */
  venueId: z.number().optional(),
  /** 노출 여부 필터 */
  visible: z.boolean().optional(),
  /** 판매자 ID 필터 */
  companyId: z.number().optional(),
});

/**
 * 공연 타입 정의
 */
export type CreatePerformanceForm = z.infer<typeof createPerformanceSchema>;
export type UpdatePerformanceForm = z.infer<typeof updatePerformanceSchema>;
export type PerformanceFilter = z.infer<typeof performanceFilterSchema>;
