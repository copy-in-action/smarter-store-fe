/**
 * 서버 컴포넌트에서 사용할 데이터 fetch 함수들
 */

import type { PerformanceResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 공연 목록을 조회합니다
 * @param fetchOptions - serverFetch에 전달할 옵션 (캐시, 인증 등)
 * @returns 공연 목록 데이터
 */
export async function getPerformancesForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse[] }>(
    "/api/performances",
    mergedOptions,
  );

  return response.data || [];
}
