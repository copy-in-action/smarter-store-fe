/**
 * 공지사항 폼 스키마 (features layer)
 * - 생성/수정 공통 스키마 (isActive는 PATCH /status 전용으로 폼에서 제외)
 * - entities 스키마 그대로 사용
 */

import type { z } from "zod";
import { createNoticeSchema } from "@/entities/notice";

/**
 * 공지사항 폼 스키마 (생성/수정 공통)
 */
export const noticeFormSchema = createNoticeSchema;

/** 공지사항 폼 데이터 타입 (생성/수정 공통) */
export type NoticeFormData = z.infer<typeof noticeFormSchema>;
