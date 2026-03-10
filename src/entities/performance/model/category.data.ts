import type { PerformanceCategory } from "./category.types";

/**
 * 공연 카테고리 데이터 (공통)
 * - features/service/home과 features/admin/performance-management에서 공유
 */
export const PERFORMANCE_CATEGORIES: readonly PerformanceCategory[] = [
  { id: "musical", name: "뮤지컬", value: "뮤지컬", image: "musical.png" },
  { id: "concert", name: "콘서트", value: "콘서트", image: "concert.png" },
  { id: "theater", name: "연극", value: "연극", image: "theater.png" },
  {
    id: "showing",
    name: "전시/행사",
    value: "전시/행사",
    image: "showing.png",
  },
  {
    id: "classic",
    name: "클래식/무용",
    value: "클래식/무용",
    image: "classic.png",
  },
  { id: "child", name: "아동/가족", value: "아동/가족", image: "child.png" },
] as const;

/**
 * 폼 셀렉트 옵션용 카테고리 배열
 * - value와 label만 포함
 */
export const CATEGORY_OPTIONS = PERFORMANCE_CATEGORIES.map((category) => ({
  value: category.value,
  label: category.name,
}));
