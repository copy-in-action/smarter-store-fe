/**
 * 공연 회차 관리 기능 Public API
 */

// API exports
export {
  useCreatePerformanceSchedule,
  useDeletePerformanceSchedule,
  useGetPerformanceSchedule,
  useGetPerformanceSchedules,
  useUpdatePerformanceSchedule,
} from "./api/performanceSchedule.queries";

// Schema exports
export type {
  CreatePerformanceScheduleFormData,
  CreatePerformanceScheduleFormInput,
  PerformanceScheduleFormData,
  PerformanceScheduleFormInput,
} from "./model/performance-schedule-form.schema";
export {
  createPerformanceScheduleFormSchema,
  performanceScheduleFormSchema,
} from "./model/performance-schedule-form.schema";

// Lib exports (외부 필요 유틸리티만)
export {
  canDeleteSchedule,
  formatDateTime,
  getScheduleStatus,
} from "./lib/utils";

// UI exports (메인 컴포넌트만)
export { PerformanceScheduleForm } from "./ui/PerformanceScheduleForm";
export { PerformanceScheduleList } from "./ui/PerformanceScheduleList";
