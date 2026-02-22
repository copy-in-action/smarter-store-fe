/**
 * Notice Entity Public API
 * - 외부에서 필요한 것만 노출
 * - UI 컴포넌트, API 함수, React Query hooks, 타입, 스키마
 */

// API 함수
export {
  createNotice,
  deleteNotice,
  fetchActiveNoticesGrouped,
  fetchAdminNoticesGrouped,
  fetchAllNotices,
  fetchNoticeById,
  updateNotice,
  updateNoticeStatus,
} from "./api/notice.api";
// React Query hooks
export {
  NOTICE_QUERY_KEYS,
  useAdminNoticesGrouped,
  useCreateNotice,
  useDeleteNotice,
  useNotice,
  useNotices,
  useNoticesGrouped,
  useUpdateNotice,
  useUpdateNoticeStatus,
} from "./api/notice.queries";
export type {
  CreateNoticeForm,
  UpdateNoticeForm,
  UpdateNoticeStatusForm,
} from "./model/notice.schema";
// 스키마 (요청용)
export {
  createNoticeSchema,
  updateNoticeSchema,
  updateNoticeStatusSchema,
} from "./model/notice.schema";
// 타입 (orval 생성 타입)
export type {
  CreateNoticeRequest,
  NoticeGroupResponse,
  NoticeResponse,
  NoticeStatusRequest,
  UpdateNoticeRequest,
} from "./model/notice.types";
// enum (런타임 값 - export type 불가)
export { NoticeCategory } from "./model/notice.types";
export type { NoticeCardProps } from "./ui/NoticeCard";
// UI 컴포넌트
export { NoticeCard } from "./ui/NoticeCard";
export type { NoticeGroupCardProps } from "./ui/NoticeGroupCard";
export { NoticeGroupCard } from "./ui/NoticeGroupCard";
