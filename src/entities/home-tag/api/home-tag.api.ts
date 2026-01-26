/**
 * 홈 태그 관련 순수 API 함수들
 * 태그별 공연 조회 및 순서 변경 기능
 */

import {
  getPerformancesByTag1,
  updateDisplayOrder,
} from "@/shared/api/orval/admin-home-tag/admin-home-tag";
import type {
  TagPerformanceResponse,
  UpdateDisplayOrderRequest,
} from "@/shared/api/orval/types";

/**
 * 태그별 공연 목록 조회 API
 * @param tag - 태그 코드
 * @returns 공연 목록 배열 (displayOrder 오름차순 정렬)
 */
export const getPerformancesByTag = async (
  tag: string,
): Promise<TagPerformanceResponse[]> => {
  const response = await getPerformancesByTag1(tag as never);
  return response.data || [];
};

/**
 * 태그 내 공연 순서 변경 API
 * @param tag - 태그 코드
 * @param request - 순서 변경 요청 데이터
 */
export const updatePerformanceOrder = async (
  tag: string,
  request: UpdateDisplayOrderRequest,
): Promise<void> => {
  await updateDisplayOrder(tag as never, request);
};
