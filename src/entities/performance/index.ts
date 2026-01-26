/**
 * Performance 엔티티 Public API
 */

// API 함수들 (순수 API, React Query 훅 제외)
export {
  createNewPerformance,
  deleteExistingPerformance,
  getPerformanceDetail,
  getPerformanceList,
  updateExistingPerformance,
} from "./api/performance.api";

// 홈 태그 API 함수들
export {
  addPerformanceHomeTag,
  deletePerformanceHomeTag,
  getPerformanceHomeTags,
} from "./api/performance-home-tag.api";
export type {
  CreatePerformanceForm,
  PerformanceFilter,
  UpdatePerformanceForm,
} from "./model/performance.schema";
export {
  createPerformanceSchema,
  performanceFilterSchema,
  updatePerformanceSchema,
} from "./model/performance.schema";

// React Query hooks
export {
  usePerformances,
  usePerformance,
  useCreatePerformance,
  useUpdatePerformance,
  useDeletePerformance,
  PERFORMANCE_QUERY_KEYS,
} from "./api/performance.queries";

// 홈 태그 React Query hooks
export {
  usePerformanceHomeTags,
  useAddPerformanceHomeTag,
  useDeletePerformanceHomeTag,
  PERFORMANCE_HOME_TAG_QUERY_KEYS,
} from "./api/performance-home-tag.queries";
