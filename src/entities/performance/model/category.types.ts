/**
 * 공연 카테고리 타입 정의
 */

/**
 * 공연 카테고리 정보
 */
export interface PerformanceCategory {
  /** 카테고리 고유 ID */
  id: string;
  /** 카테고리 이름 (한글) */
  name: string;
  /** 카테고리 값 */
  value: string;
  /** 카테고리 이미지 파일명 */
  image: string;
}
