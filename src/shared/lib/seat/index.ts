/**
 * Seat Chart Library - Public API
 * FSD 아키텍처에 따른 좌석 차트 라이브러리
 */

// Components
export { default as SeatChart } from "./components/SeatChart";
export { StaticSeatChart } from "./components/StaticSeatChart";
// Constants
export { PRESET_COLORS } from "./constants/seatChart.constants";
// Hooks
export { useSeatChart, useSeatStatus } from "./hooks/useSeatChart";
// Types
export type {
  BookingStatus,
  SeatChartConfig,
  SeatChartMode,
  SeatPosition,
  SeatStatus,
  SeatType,
  SeatTypeObject,
  StaticSeatVenue,
  UserSeatSelection,
} from "./types/seatLayout.types";
export { MAX_SEAT_SELECTION } from "./types/seatLayout.types";

// Utils
export {
  getSeatType,
  isSeatInState,
  seatPositionToString,
  validateSeatPosition,
} from "./utils/seatChart.utils";

export {
  checkGradeInfoUpdates,
  convertForBEStorage,
  extractSeatGradeInfo,
  restoreStaticSeatVenue,
} from "./utils/seatConverters";
