import { z } from "zod";

/**
 * 판매자 응답 스키마
 */
export const companyResponseSchema = z.object({
  /** 회사 ID */
  id: z.number(),
  /** 상호 */
  name: z.string().min(1, "상호는 필수입니다"),
  /** 대표자명 */
  ceoName: z.string().optional(),
  /** 사업자등록번호 */
  businessNumber: z.string().min(1, "사업자등록번호는 필수입니다"),
  /** 이메일 */
  email: z.email("유효한 이메일을 입력하세요").optional().or(z.literal("")),
  /** 연락처 */
  contact: z.string().optional(),
  /** 주소 */
  address: z.string().optional(),
  /** 공연 문의 연락처/이메일 */
  performanceInquiry: z.string().optional(),
});

/**
 * 판매자 생성/수정 요청 스키마
 */
export const companyRequestSchema = z.object({
  /** 상호 */
  name: z
    .string()
    .min(1, "상호는 필수입니다")
    .max(100, "상호는 100자를 초과할 수 없습니다"),
  /** 대표자명 */
  ceoName: z
    .string()
    .max(50, "대표자명은 50자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
  /** 사업자등록번호 */
  businessNumber: z
    .string()
    .min(1, "사업자등록번호는 필수입니다")
    .regex(
      /^\d{3}-\d{2}-\d{5}$|^\d{10}$/,
      "사업자등록번호 형식이 올바르지 않습니다",
    ),
  /** 이메일 */
  email: z
    .email("유효한 이메일을 입력하세요")
    .max(100, "이메일은 100자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
  /** 연락처 */
  contact: z
    .string()
    .max(20, "연락처는 20자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
  /** 주소 */
  address: z
    .string()
    .max(200, "주소는 200자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
  /** 공연 문의 연락처/이메일 */
  performanceInquiry: z
    .string()
    .max(100, "공연 문의는 100자를 초과할 수 없습니다")
    .optional()
    .or(z.literal("")),
});

/**
 * 판매자 검색 필터 스키마
 */
export const companyFilterSchema = z.object({
  /** 검색어 (상호, 대표자명, 사업자번호) */
  search: z.string().optional(),
  /** 이메일 필터 */
  hasEmail: z.boolean().optional(),
  /** 연락처 필터 */
  hasContact: z.boolean().optional(),
});

/**
 * Zod 스키마에서 추론된 타입
 */
export type Company = z.infer<typeof companyResponseSchema>;
export type CompanyRequest = z.infer<typeof companyRequestSchema>;
export type CompanyFilter = z.infer<typeof companyFilterSchema>;
