/**
 * 공지사항 Zod 스키마 (entities layer)
 * - 순수 도메인 검증 (서버 API 스펙)
 * - 요청 스키마만 정의 (응답 스키마는 orval 타입 사용)
 */

import { z } from "zod";
import { NoticeCategory } from "./notice.types";

/**
 * 공지사항 생성 스키마
 * 용도: POST /admin/notices
 * Note: isActive는 서버에서 항상 false로 설정하므로 요청에 포함하지 않음
 */
export const createNoticeSchema = z.object({
  /** 카테고리 */
  category: z.enum(NoticeCategory),
  /** 공지사항 내용 */
  content: z.string().min(10, "내용은 최소 10자 이상 입력해주세요"),
});

/**
 * 공지사항 수정 스키마
 * 용도: PUT /admin/notices/{id}
 * Note: isActive는 PATCH /admin/notices/{id}/status 전용이므로 포함하지 않음
 */
export const updateNoticeSchema = z.object({
  /** 공지사항 내용 */
  content: z.string().min(10, "내용은 최소 10자 이상 입력해주세요"),
});
/**
 * 공지사항 상태 변경 스키마
 * 용도: PATCH /admin/notices/{id}/status
 */
export const updateNoticeStatusSchema = z.object({
  /** 활성화 여부 */
  isActive: z.boolean(),
});

// 타입 추론 (CreateNoticeForm은 category, content만 포함 - isActive 제외)
export type CreateNoticeForm = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeForm = z.infer<typeof updateNoticeSchema>;
export type UpdateNoticeStatusForm = z.infer<typeof updateNoticeStatusSchema>;
