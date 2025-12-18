import type { SeatingChartResponse } from "@/shared/api/orval/types";
import { getGetSeatingChartUrl } from "@/shared/api/orval/venue/venue";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버 사이드에서 좌석 배치도를 조회합니다
 * @param venueId - 공연장 ID
 * @returns 좌석 배치도 데이터 또는 null
 */
export async function fetchSeatingChartOnServer(
  venueId: number,
): Promise<SeatingChartResponse | null> {
  try {
    const response = await serverFetch<{
      status: number;
      data: SeatingChartResponse;
    }>(getGetSeatingChartUrl(venueId), {
      method: "GET",
      requireAuth: true,
      requireAdmin: true,
    });

    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.error("서버사이드 좌석 배치도 조회 실패:", error);
    return null;
  }
}
