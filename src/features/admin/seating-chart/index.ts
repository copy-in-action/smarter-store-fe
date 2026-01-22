/**
 * 관리자 좌석 배치도 관리 기능 Public API
 */

// API hooks (외부에서 필요)
export { useSeatingChart, useSaveSeatingChart } from "./lib/hooks";

// Types
export type { SeatingChartPageProps } from "./model/types";

// UI Components (메인 컴포넌트만)
export { SeatingChartManager } from "./ui/SeatingChartManager";
