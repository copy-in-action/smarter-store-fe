/**
 * 서버 컴포넌트에서 사용할 공지사항 데이터 fetch 함수들
 */

import { getGetActiveNoticesGroupedUrl } from "@/shared/api/orval/notice/notice";
import type { NoticeGroupResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 활성화된 공지사항을 카테고리별로 그룹화하여 조회합니다
 * @param fetchOptions - serverFetch에 전달할 옵션 (캐시, 인증 등)
 * @returns 카테고리별 그룹화된 공지사항 목록
 */
export async function getActiveNoticesGroupedForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<NoticeGroupResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: NoticeGroupResponse[] }>(
    getGetActiveNoticesGroupedUrl(),
    mergedOptions,
  );

  return response.data || [];
}
