/**
 * 공연 관련 Zod 스키마 정의
 */

import { z } from "zod";

/**
 * 공연 응답 스키마
 */
export const performanceSchema = z.object({
  /** 공연 ID */
  id: z.number(),
  /** 공연명 */
  title: z.string(),
  /** 공연 상세 설명 */
  description: z.string().optional(),
  /** 공연 카테고리 */
  category: z.string(),
  /** 공연 시간 (분) */
  runningTime: z.number().optional(),
  /** 공연 관람 연령 */
  ageRating: z.string().optional(),
  /** 공연 대표 이미지 URL */
  mainImageUrl: z.string().optional(),
  /** 공연 노출 여부 */
  visible: z.boolean(),
  /** 공연장 정보 */
  venue: z.object({
    /** 공연장 ID */
    id: z.number(),
    /** 공연장명 */
    name: z.string(),
    /** 공연장 주소 */
    address: z.string().optional(),
    /** 공연장 전화번호 */
    phoneNumber: z.string().optional(),
    /** 공연장 웹사이트 */
    website: z.string().optional(),
  }).optional(),
  /** 공연 시작일 */
  startDate: z.string(),
  /** 공연 종료일 */
  endDate: z.string(),
  /** 공연 정보 생성일시 */
  createdAt: z.string().optional(),
  /** 공연 정보 수정일시 */
  updatedAt: z.string().optional(),
});

/**
 * 공연 생성 요청 스키마
 */
export const createPerformanceSchema = z.object({
  /** 공연명 */
  title: z.string().min(1, "공연명을 입력해주세요"),
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
  venueId: z.number().positive("공연장을 선택해주세요"),
  /** 공연 시작일 */
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  /** 공연 종료일 */
  endDate: z.string().min(1, "종료일을 입력해주세요"),
});

/**
 * 공연 수정 요청 스키마
 */
export const updatePerformanceSchema = createPerformanceSchema.partial();

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
});

/**
 * 공연 타입 정의
 */
export type Performance = z.infer<typeof performanceSchema>;
export type CreatePerformanceForm = z.infer<typeof createPerformanceSchema>;
export type UpdatePerformanceForm = z.infer<typeof updatePerformanceSchema>;
export type PerformanceFilter = z.infer<typeof performanceFilterSchema>;