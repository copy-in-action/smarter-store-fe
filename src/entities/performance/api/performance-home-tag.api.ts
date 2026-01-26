/**
 * 공연 홈 태그 관련 순수 API 함수들
 * 공연을 홈 화면 섹션에 태그로 등록/삭제하는 기능
 */

import {
  addHomeTag,
  getHomeTagsByPerformance,
  removeHomeTag,
} from "@/shared/api/orval/admin-home-tag/admin-home-tag";
import type {
  AddHomeTagRequest,
  PerformanceHomeTagResponse,
} from "@/shared/api/orval/types";

/**
 * 공연의 홈 태그 목록 조회 API
 * @param performanceId - 공연 ID
 * @returns 홈 태그 목록 배열
 */
export const getPerformanceHomeTags = async (
  performanceId: number,
): Promise<PerformanceHomeTagResponse[]> => {
  const response = await getHomeTagsByPerformance(performanceId);
  return (response.data || []) as PerformanceHomeTagResponse[];
};

/**
 * 공연에 홈 태그 추가 API
 * @param performanceId - 공연 ID
 * @param request - 태그 추가 요청 데이터
 * @returns 추가된 태그 정보
 */
export const addPerformanceHomeTag = async (
  performanceId: number,
  request: AddHomeTagRequest,
): Promise<PerformanceHomeTagResponse> => {
  const response = await addHomeTag(performanceId, request);
  return response.data as PerformanceHomeTagResponse;
};

/**
 * 공연의 홈 태그 삭제 API
 * @param performanceId - 공연 ID
 * @param tag - 삭제할 태그 코드
 */
export const deletePerformanceHomeTag = async (
  performanceId: number,
  tag: string,
): Promise<void> => {
  await removeHomeTag(
    performanceId,
    tag as Parameters<typeof removeHomeTag>[1],
  );
};
