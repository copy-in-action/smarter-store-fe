/**
 * 공연 카테고리 정보
 */
export interface CategoryInfo {
  /** 카테고리 ID */
  id: string;
  /** 카테고리명 */
  name: string;
  /** 이미지 파일명 */
  image: string;
  /** 필터값 */
  value: string;
}