import { updateSeatingChart } from "@/shared/api/orval/admin-venue/admin-venue";
import type {
  SeatingChartRequest,
  SeatingChartResponse,
} from "@/shared/api/orval/types";
import { getSeatingChart } from "@/shared/api/orval/venue/venue";

/**
 * 좌석 배치도를 조회합니다
 * @param venueId - 공연장 ID
 * @returns 좌석 배치도 데이터
 */
export async function fetchSeatingChart(
  venueId: number,
): Promise<SeatingChartResponse | null> {
  try {
    const response = await getSeatingChart(venueId);
    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.error("좌석 배치도 조회 실패:", error);
    return null;
  }
}

/**
 * 좌석 배치도를 저장/수정합니다
 * @param venueId - 공연장 ID
 * @param request - 좌석 배치도 요청 데이터
 * @returns 저장된 좌석 배치도 데이터
 */
export async function saveSeatingChart(
  venueId: number,
  request: SeatingChartRequest,
): Promise<SeatingChartResponse> {
  const response = await updateSeatingChart(venueId, request);

  if (response.status !== 200) {
    throw new Error("좌석 배치도 저장에 실패했습니다");
  }

  return response.data;
}
