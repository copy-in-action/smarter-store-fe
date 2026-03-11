import {
  PERFORMANCE_CATEGORIES,
  type PerformanceCategory,
} from "@/entities/performance";

/**
 * 홈 화면 카테고리 데이터
 * -  공연 카테고리
 */
export const categories: readonly PerformanceCategory[] = [
  ...PERFORMANCE_CATEGORIES,
] as const;
