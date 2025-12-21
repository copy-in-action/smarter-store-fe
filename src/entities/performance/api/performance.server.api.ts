/**
 * 서버 컴포넌트에서 사용할 데이터 fetch 함수들
 */

import {
  getGetAllPerformancesUrl,
  getGetPerformanceUrl,
} from "@/shared/api/orval/performance/performance";
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
    getGetAllPerformancesUrl(),
    mergedOptions,
  );

  return response.data || [];
}

/**
 * 서버에서 공연 상세 조회합니다
 * @param performanceId - 공연 아이디
 * @param fetchOptions - serverFetch에 전달할 옵션 (캐시, 인증 등)
 * @returns 공연 상세 데이터
 */
export async function getPerformanceDetailForServer(
  performanceId: number,
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<PerformanceResponse> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: PerformanceResponse }>(
    getGetPerformanceUrl(performanceId),
    mergedOptions,
  );

  return response.data || [];
}

/**
 * 공연 존재 여부를 확인합니다 (notFound 처리용)
 * @param id - 공연 ID
 * @returns 공연 존재 여부
 */
export async function checkPerformanceExists(id: number): Promise<boolean> {
  try {
    await getPerformanceDetailForServer(id);
    return true;
  } catch {
    return false;
  }
}
