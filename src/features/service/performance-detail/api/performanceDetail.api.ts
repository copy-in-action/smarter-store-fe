/**
 * 서비스 페이지용 공연 상세 API (SSR 지원)
 */

import type { PerformanceResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 공연 상세 정보를 조회합니다 (SSR용)
 * @param id - 공연 ID
 * @returns 공연 상세 정보
 * @throws API 오류 시 에러 발생
 */
export async function getPerformanceDetailForServer(
  id: number,
): Promise<PerformanceResponse> {
  try {
    const response = await serverFetch<{ data: PerformanceResponse }>(
      `/api/performances/${id}`,
      {
        cache: "force-cache", // 상세 페이지는 캐시 활용
        next: { revalidate: 10 }, // 1시간 캐시
        requireAuth: false, // 공개 API - 인증 불필요
      },
    );

    if (!response.data) {
      throw new Error(`공연 정보를 찾을 수 없습니다. (ID: ${id})`);
    }

    return response.data;
  } catch (error) {
    console.error(`공연 상세 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
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
