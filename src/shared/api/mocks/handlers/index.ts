import { getPerformanceHandler } from "./performance.handlers";
import {
  getScheduleDatesHandler,
  getSchedulesHandler,
} from "./performance-schedule.handlers";
import { scheduleHandlers } from "./schedule.handlers";
import { venueHandlers } from "./venue.handlers";

/**
 * MSW 핸들러 목록
 * 특정 API만 모킹하려면 필요한 핸들러만 추가하세요
 *
 * 사용 가능한 핸들러:
 * [공연 정보]
 * - getPerformanceHandler: GET /api/performances/:id
 *
 * [공연 회차]
 * - getSchedulesHandler: GET /api/performances/:id/schedules
 * - getScheduleDatesHandler: GET /api/performances/:id/schedules/dates
 * - createScheduleHandler: POST /api/performances/:id/schedules
 * - getScheduleHandler: GET /api/performances/schedules/:scheduleId
 * - updateScheduleHandler: PUT /api/performances/schedules/:scheduleId
 * - deleteScheduleHandler: DELETE /api/performances/schedules/:scheduleId
 *
 * [회차 정보]
 * - scheduleHandlers: GET /api/schedules/:id
 *
 * [공연장]
 * - venueHandlers: GET /api/venues/:id/seating-chart
 *
 * [예매]
 * - bookingHandlers: POST /api/bookings/start, DELETE /api/bookings/:id
 */
export const handlers = [
  getPerformanceHandler, // 공연 상세 정보 조회
  getSchedulesHandler, // 회차 목록 조회
  getScheduleDatesHandler, // 예매 가능한 날짜 목록 조회
  ...scheduleHandlers, // 회차 정보 조회
  ...venueHandlers, // 좌석 배치도 조회
];
