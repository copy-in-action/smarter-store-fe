/**
 * 서버 컴포넌트에서 사용할 좌석배치도 fetch 함수들
 */

import type { SeatingChartResponse } from "@/shared/api/orval/types";
import { getGetSeatingChartUrl } from "@/shared/api/orval/venue/venue";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 공연장 좌석배치도를 조회합니다
 * @param venueId - 공연장 아이디
 * @param fetchOptions - serverFetch에 전달할 옵션 (캐시, 인증 등)
 * @returns 좌석배치도 데이터
 */
export async function getSeatingChartForServer(
  venueId: number,
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<SeatingChartResponse> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  const response = await serverFetch<{ data: SeatingChartResponse }>(
    getGetSeatingChartUrl(venueId),
    mergedOptions,
  );

  return response.data;
}