/**
 * 서버 컴포넌트에서 사용할 데이터 fetch 함수들
 */

import type { PerformanceResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 공연 목록을 직접 fetch (홈페이지용 - 캐시 없음)
 * @returns 공연 목록 데이터
 * @throws {ApiError} API 요청 실패 시 에러 throw (error.tsx가 처리)
 */
export async function getPerformancesForServer(): Promise<
  PerformanceResponse[]
> {
  // 홈페이지에서는 실시간 데이터 필요 (신규 등록 즉시 반영)
  const response = await serverFetch<{ data: PerformanceResponse[] }>(
    "/api/performances",
    {
      cache: "no-store", // Next.js fetch 캐시 비활성화
      requireAuth: false, // 공개 API - 인증 불필요
    },
  );

  return response.data || [];
}
