/**
 * 공지사항 React Query hooks (entities layer)
 * - API 함수를 React Query로 래핑
 * - 캐시 관리 및 상태 동기화
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  NoticeStatusRequest,
} from "@/shared/api/orval/types";
import {
  fetchAllNotices,
  fetchNoticeById,
  fetchActiveNoticesGrouped,
  fetchAdminNoticesGrouped,
  createNotice,
  updateNotice,
  updateNoticeStatus,
  deleteNotice,
} from "./notice.api";

/**
 * 공지사항 쿼리 키 상수
 */
export const NOTICE_QUERY_KEYS = {
  all: ["notices"] as const,
  lists: () => [...NOTICE_QUERY_KEYS.all, "list"] as const,
  grouped: () => [...NOTICE_QUERY_KEYS.all, "grouped"] as const,
  adminGrouped: () => [...NOTICE_QUERY_KEYS.all, "admin-grouped"] as const,
  details: () => [...NOTICE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...NOTICE_QUERY_KEYS.details(), id] as const,
};

/**
 * 전체 공지사항 목록 조회 (관리자용)
 * @returns 전체 공지사항 목록
 */
export const useNotices = () => {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.lists(),
    queryFn: fetchAllNotices,
  });
};

/**
 * 카테고리별 그룹화된 공지사항 조회 (활성화된 것만)
 * @returns 카테고리별 그룹화된 공지사항 목록
 */
export const useNoticesGrouped = () => {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.grouped(),
    queryFn: fetchActiveNoticesGrouped,
  });
};

/**
 * 카테고리별 그룹화된 공지사항 조회 (관리자용 - 모든 카테고리)
 * @returns 카테고리별 그룹화된 공지사항 목록 (활성/비활성 모두 포함, 공지사항이 없는 카테고리도 포함)
 */
export const useAdminNoticesGrouped = () => {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.adminGrouped(),
    queryFn: fetchAdminNoticesGrouped,
  });
};

/**
 * 특정 공지사항 상세 조회
 * @param id - 공지사항 ID
 * @returns 공지사항 상세 정보
 */
export const useNotice = (id: number) => {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.detail(id),
    queryFn: () => fetchNoticeById(id),
    enabled: !!id && id > 0,
  });
};

/**
 * 공지사항 생성 뮤테이션
 * @returns 생성 뮤테이션 훅
 */
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoticeRequest) => createNotice(data),
    onSuccess: () => {
      // 공지사항 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.grouped() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.adminGrouped() });
    },
  });
};

/**
 * 공지사항 수정 뮤테이션
 * @returns 수정 뮤테이션 훅
 */
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNoticeRequest }) =>
      updateNotice(id, data),
    onSuccess: (_, { id }) => {
      // 공지사항 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.grouped() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.adminGrouped() });
      // 수정된 공지사항의 상세 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.detail(id) });
    },
  });
};

/**
 * 공지사항 상태 변경 뮤테이션
 * @returns 상태 변경 뮤테이션 훅
 */
export const useUpdateNoticeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NoticeStatusRequest }) =>
      updateNoticeStatus(id, data),
    onSuccess: (_, { id }) => {
      // 공지사항 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.grouped() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.adminGrouped() });
      // 수정된 공지사항의 상세 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.detail(id) });
    },
  });
};

/**
 * 공지사항 삭제 뮤테이션
 * @returns 삭제 뮤테이션 훅
 */
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotice(id),
    onSuccess: () => {
      // 공지사항 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.grouped() });
      queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEYS.adminGrouped() });
    },
  });
};
