/**
 * 홈 섹션 메타데이터 관련 순수 API 함수들
 * 홈 화면 섹션 및 태그 구조 정보 조회
 */

import { getSectionsMetadata } from "@/shared/api/orval/admin-home-tag/admin-home-tag";
import type { SectionMetadataResponse } from "@/shared/api/orval/types";

/**
 * 홈 섹션 메타데이터 조회 API
 * 모든 섹션과 해당 섹션의 태그 목록을 조회
 * @returns 섹션 메타데이터 배열
 */
export const getHomeSectionsMetadata = async (): Promise<
  SectionMetadataResponse[]
> => {
  const response = await getSectionsMetadata();
  return response.data || [];
};
