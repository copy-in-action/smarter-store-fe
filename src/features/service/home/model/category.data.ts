import {
  PERFORMANCE_CATEGORIES,
  type PerformanceCategory,
} from "@/entities/performance";

/**
 * 타임특가 카테고리 (홈 화면 전용)
 */
const TIME_SPECIAL_CATEGORY: PerformanceCategory = {
  id: "timeSpecial",
  name: "타임특가",
  image: "timeSpecial.png",
  value: "timeSpecial",
};

/**
 * 홈 화면 카테고리 데이터
 * - 타임특가 + 공연 카테고리
 */
export const categories: readonly PerformanceCategory[] = [
  TIME_SPECIAL_CATEGORY,
  ...PERFORMANCE_CATEGORIES,
] as const;