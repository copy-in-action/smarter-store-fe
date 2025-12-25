/**
 * 서비스 페이지 공연 상세 기능 Public API
 */

// Types exports
export type {
  HashTagItem,
  PerformanceInfoProps,
  ServicePerformanceDetailProps,
} from "./model/types";

// UI 컴포넌트 exports
export { PerformanceDescription } from "./ui/PerformanceDescription";
export { PerformanceHashTags } from "./ui/PerformanceHashTags";
export { PerformanceImageCarousel } from "./ui/PerformanceImageCarousel";
export { PerformanceInfo } from "./ui/PerformanceInfo";
export { PerformanceMainImage } from "./ui/PerformanceMainImage";
export { PerformanceTitle } from "./ui/PerformanceTitle";
export { ServicePerformanceDetail } from "./ui/ServicePerformanceDetail";

// API exports
export { getPerformanceDates, getPerformancesByDate } from "./api/performanceSchedule.api";

// Hooks exports  
export { usePerformanceDates, usePerformancesByDate } from "./lib/usePerformanceSchedules";
