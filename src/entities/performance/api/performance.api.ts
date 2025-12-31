/**
 * 공연 관련 순수 API 함수들
 * 데이터 변환 로직을 포함한 비즈니스 로직
 */

import {
  createPerformance,
  deletePerformance,
  updatePerformance,
} from "@/shared/api/orval/admin-performance/admin-performance";
import {
  getAllPerformances,
  getPerformance,
} from "@/shared/api/orval/performance/performance";
import type {
  CreatePerformanceRequest,
  PerformanceResponse,
  UpdatePerformanceRequest,
} from "@/shared/api/orval/types";

/**
 * 모든 공연 목록 조회 API
 * @returns 공연 목록 배열
 */
export const getPerformanceList = async (): Promise<PerformanceResponse[]> => {
  const response = await getAllPerformances();
  return response.data || [];
};

/**
 * 특정 공연 정보 조회 API
 * @param id - 공연 ID
 * @returns 공연 정보
 */
export const getPerformanceDetail = async (
  id: number,
): Promise<PerformanceResponse> => {
  const response = await getPerformance(id);
  return response.data as PerformanceResponse;
};

/**
 * 공연 생성 API
 * @param performanceData - 공연 생성 요청 데이터
 * @returns 생성된 공연 정보
 */
export const createNewPerformance = async (
  performanceData: CreatePerformanceRequest,
) => {
  const response = await createPerformance(performanceData);
  return response.data;
};

/**
 * 공연 수정 API
 * @param id - 공연 ID
 * @param data - 공연 수정 요청 데이터
 * @returns 수정된 공연 정보
 */
export const updateExistingPerformance = async (
  id: number,
  data: UpdatePerformanceRequest,
) => {
  const response = await updatePerformance(id, data);
  return response.data;
};

/**
 * 공연 삭제 API
 * @param performanceId - 삭제할 공연 ID
 * @returns 삭제 결과
 */
export const deleteExistingPerformance = async (performanceId: number) => {
  const response = await deletePerformance(performanceId);
  return response.data;
};
