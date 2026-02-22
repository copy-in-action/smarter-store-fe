/**
 * 공지사항 API 함수 (entities layer)
 * - Orval 생성 API 함수 래핑
 * - 에러 처리 및 데이터 변환 로직 추가 가능
 */

import {
  createNotice as orvalCreateNotice,
  updateNotice as orvalUpdateNotice,
  deleteNotice as orvalDeleteNotice,
  getNoticeById as orvalGetNoticeById,
  getAllNotices as orvalGetAllNotices,
  updateNoticeStatus as orvalUpdateNoticeStatus,
  getAllNoticesGrouped as orvalGetAllNoticesGrouped,
} from "@/shared/api/orval/admin-notice/admin-notice";
import { getActiveNoticesGrouped as orvalGetActiveNoticesGrouped } from "@/shared/api/orval/notice/notice";
import type {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  NoticeStatusRequest,
  NoticeResponse,
  NoticeGroupResponse,
} from "@/shared/api/orval/types";

/**
 * 공지사항 목록 조회 (관리자용 - 전체)
 * @returns 전체 공지사항 목록
 */
export async function fetchAllNotices(): Promise<NoticeResponse[]> {
  const response = await orvalGetAllNotices();
  return response.data;
}

/**
 * 공지사항 상세 조회
 * @param id - 공지사항 ID
 * @returns 공지사항 상세 정보
 */
export async function fetchNoticeById(id: number): Promise<NoticeResponse> {
  const response = await orvalGetNoticeById(id);
  return response.data;
}

/**
 * 카테고리별 그룹화된 공지사항 조회 (활성화된 것만)
 * @returns 카테고리별 그룹화된 공지사항 목록
 */
export async function fetchActiveNoticesGrouped(): Promise<
  NoticeGroupResponse[]
> {
  const response = await orvalGetActiveNoticesGrouped();
  return response.data;
}

/**
 * 카테고리별 그룹화된 공지사항 조회 (관리자용 - 모든 카테고리)
 * @returns 카테고리별 그룹화된 공지사항 목록 (활성/비활성 모두 포함, 공지사항이 없는 카테고리도 포함)
 */
export async function fetchAdminNoticesGrouped(): Promise<
  NoticeGroupResponse[]
> {
  const response = await orvalGetAllNoticesGrouped();
  return response.data;
}

/**
 * 공지사항 생성
 * @param data - 생성할 공지사항 데이터
 * @returns 생성된 공지사항 정보
 */
export async function createNotice(
  data: CreateNoticeRequest,
): Promise<NoticeResponse> {
  const response = await orvalCreateNotice(data);
  return response.data;
}

/**
 * 공지사항 수정
 * @param id - 공지사항 ID
 * @param data - 수정할 공지사항 데이터
 * @returns 수정된 공지사항 정보
 */
export async function updateNotice(
  id: number,
  data: UpdateNoticeRequest,
): Promise<NoticeResponse> {
  const response = await orvalUpdateNotice(id, data);
  return response.data;
}

/**
 * 공지사항 상태 변경
 * @param id - 공지사항 ID
 * @param data - 상태 변경 데이터
 * @returns 수정된 공지사항 정보
 */
export async function updateNoticeStatus(
  id: number,
  data: NoticeStatusRequest,
): Promise<NoticeResponse> {
  const response = await orvalUpdateNoticeStatus(id, data);
  return response.data;
}

/**
 * 공지사항 삭제
 * @param id - 공지사항 ID
 */
export async function deleteNotice(id: number): Promise<void> {
  await orvalDeleteNotice(id);
}
