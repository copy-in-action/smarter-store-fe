/**
 * 서비스 페이지 공연 상세 관련 타입 정의
 */

import type { PerformanceResponse } from "@/shared/api/orval/types";

/**
 * 공연 상세 페이지 컴포넌트 속성
 */
export interface ServicePerformanceDetailProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
}

/**
 * 공연 정보 컴포넌트 속성
 */
export interface PerformanceInfoProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
}

/**
 * 해시태그 네비게이션 항목
 */
export interface HashTagItem {
  /** 해시태그 ID (앵커 링크용) */
  id: string;
  /** 표시할 텍스트 */
  label: string;
}
