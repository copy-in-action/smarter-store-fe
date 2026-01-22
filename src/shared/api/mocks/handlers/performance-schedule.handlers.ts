import { formatISO } from "date-fns";
import { type HttpHandler, HttpResponse, http } from "msw";
import type {
  AvailableScheduleResponse,
  CreatePerformanceScheduleRequest,
  PerformanceScheduleResponse,
  UpdatePerformanceScheduleRequest,
} from "../../orval/types";
import {
  getNextScheduleId,
  getNextTicketOptionId,
  mockPerformanceSchedules,
} from "../data/performance-schedules";

/**
 * 특정 공연의 예매 가능한 회차 조회 (잔여석 포함)
 * GET /api/performances/:id/schedules
 */
export const getSchedulesHandler = http.get(
  "/api/performances/:id/schedules",
  ({ params }) => {
    const performanceId = Number(params.id);
    const schedules = mockPerformanceSchedules.get(performanceId) || [];

    // AvailableScheduleResponse 형태로 변환
    const availableSchedules: AvailableScheduleResponse[] = schedules.map(
      (schedule) => ({
        id: schedule.id,
        showDateTime: schedule.showDateTime,
        ticketOptions: schedule.ticketOptions.map((option) => ({
          seatGrade: option.seatGrade,
          price: option.price,
          remainingSeats: 10, // 목 데이터이므로 임의의 잔여석 수
        })),
      }),
    );

    return HttpResponse.json(availableSchedules);
  },
);

/**
 * 예매 가능한 회차 날짜 목록 조회
 * GET /api/performances/:id/schedules/dates
 */
export const getScheduleDatesHandler = http.get(
	"/api/performances/:id/schedules/dates",
	({ params }) => {
		const performanceId = Number(params.id);
		const schedules = mockPerformanceSchedules.get(performanceId) || [];

		// 티켓 판매가 시작되고 공연이 아직 시작하지 않은 회차의 날짜만 추출
		const now = new Date();
		const availableDates = schedules
			.filter((schedule) => {
				const saleStartDate = new Date(schedule.saleStartDateTime);
				const showDate = new Date(schedule.showDateTime);
				return saleStartDate <= now && showDate > now;
			})
			.map((schedule) => {
				// ISO 8601 형식으로 날짜의 00:00:00 시간 반환
				const showDate = new Date(schedule.showDateTime);
				return new Date(
					showDate.getFullYear(),
					showDate.getMonth(),
					showDate.getDate(),
				).toISOString();
			})
			.filter((date, index, self) => self.indexOf(date) === index) // 중복 제거
			.sort(); // 날짜 정렬

		return HttpResponse.json(availableDates);
	},
);

/**
 * 공연 회차 생성
 * POST /api/performances/:id/schedules
 */
export const createScheduleHandler = http.post(
  "/api/performances/:id/schedules",
  async ({ params, request }) => {
    const performanceId = Number(params.id);
    const body = (await request.json()) as CreatePerformanceScheduleRequest;

    const newSchedule: PerformanceScheduleResponse = {
      id: getNextScheduleId(),
      showDateTime: body.showDateTime,
      saleStartDateTime: body.saleStartDateTime,
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
      ticketOptions: body.ticketOptions.map((option) => ({
        id: getNextTicketOptionId(),
        seatGrade: option.seatGrade,
        price: option.price,
      })),
    };

    const schedules = mockPerformanceSchedules.get(performanceId) || [];
    schedules.push(newSchedule);
    mockPerformanceSchedules.set(performanceId, schedules);

    return HttpResponse.json(newSchedule);
  },
);

/**
 * 단일 공연 회차 조회
 * GET /api/performances/schedules/:scheduleId
 */
export const getScheduleHandler = http.get(
  "/api/performances/schedules/:scheduleId",
  ({ params }) => {
    const scheduleId = Number(params.scheduleId);

    for (const schedules of mockPerformanceSchedules.values()) {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        return HttpResponse.json(schedule);
      }
    }

    return HttpResponse.json(
      { message: "Schedule not found" },
      { status: 404 },
    );
  },
);

/**
 * 공연 회차 수정
 * PUT /api/performances/schedules/:scheduleId
 */
export const updateScheduleHandler = http.put(
  "/api/performances/schedules/:scheduleId",
  async ({ params, request }) => {
    const scheduleId = Number(params.scheduleId);
    const body = (await request.json()) as UpdatePerformanceScheduleRequest;

    for (const [
      performanceId,
      schedules,
    ] of mockPerformanceSchedules.entries()) {
      const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);
      if (scheduleIndex !== -1) {
        const updatedSchedule: PerformanceScheduleResponse = {
          ...schedules[scheduleIndex],
          showDateTime: body.showDateTime,
          saleStartDateTime: body.saleStartDateTime,
          updatedAt: formatISO(new Date()),
          ticketOptions: body.ticketOptions.map((option) => ({
            id: getNextTicketOptionId(),
            seatGrade: option.seatGrade,
            price: option.price,
          })),
        };

        schedules[scheduleIndex] = updatedSchedule;
        mockPerformanceSchedules.set(performanceId, schedules);

        return HttpResponse.json(updatedSchedule);
      }
    }

    return HttpResponse.json(
      { message: "Schedule not found" },
      { status: 404 },
    );
  },
);

/**
 * 공연 회차 삭제
 * DELETE /api/performances/schedules/:scheduleId
 */
export const deleteScheduleHandler = http.delete(
  "/api/performances/schedules/:scheduleId",
  ({ params }) => {
    const scheduleId = Number(params.scheduleId);

    for (const [
      performanceId,
      schedules,
    ] of mockPerformanceSchedules.entries()) {
      const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);
      if (scheduleIndex !== -1) {
        schedules.splice(scheduleIndex, 1);
        mockPerformanceSchedules.set(performanceId, schedules);

        return new HttpResponse(null, { status: 204 });
      }
    }

    return HttpResponse.json(
      { message: "Schedule not found" },
      { status: 404 },
    );
  },
);

/**
 * 공연 회차 관련 모든 MSW 핸들러
 */
export const performanceScheduleHandlers: HttpHandler[] = [
  getSchedulesHandler,
  getScheduleDatesHandler,
  createScheduleHandler,
  getScheduleHandler,
  updateScheduleHandler,
  deleteScheduleHandler,
];
