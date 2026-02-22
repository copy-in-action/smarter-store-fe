/**
 * 공지사항 관련 타입 정의 (entities layer)
 * - Orval 자동 생성 타입 re-export
 * - 필요시 확장 타입 추가
 */

// Orval 생성 타입 re-export
export {
  type CreateNoticeRequest,
  NoticeCategory,
  type NoticeGroupResponse,
  type NoticeResponse,
  type NoticeStatusRequest,
  type UpdateNoticeRequest,
} from "@/shared/api/orval/types";
