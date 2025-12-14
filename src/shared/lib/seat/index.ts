/**
 * Seat Chart Library - Public API
 * FSD 아키텍처에 따른 좌석 차트 라이브러리
 */

// Types
export type {
  BookingStatus,
  SeatChartConfig,
  SeatChartMode,
  SeatGradeConfig,
  SeatPosition,
  SeatStatus,
  SeatType,
  StaticSeatVenue,
  UserSeatSelection,
} from "./types/seatLayout.types";

// Hooks
export { useSeatChart, useSeatStatus } from "./hooks/useSeatChart";

// Components
export { default as SeatChart } from "./components/SeatChart";
export { default as BookingSeatChart } from "./components/BookingSeatChart";
export { default as SeatConfig } from "./components/SeatConfig";

// Constants
export { PRESET_COLORS } from "./constants/seatChart.constants";

// Utils
export {
  isSeatInState,
  getSeatType,
  seatPositionToString,
  validateSeatPosition,
} from "./utils/seatChart.utils";