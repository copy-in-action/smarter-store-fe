import { type HttpHandler, HttpResponse, http } from "msw";
import type { AvailableScheduleResponse } from "../../orval/types";
import { mockPerformanceSchedules } from "../data/performance-schedules";

/**
 * 단일 회차 정보 조회 (가격 정보 포함)
 * GET /api/schedules/:id
 */
export const getScheduleHandler = http.get("/api/schedules/:id", ({ params }) => {
	const scheduleId = Number(params.id);

	// 모든 공연의 스케줄에서 해당 ID 찾기
	for (const schedules of mockPerformanceSchedules.values()) {
		const schedule = schedules.find((s) => s.id === scheduleId);
		if (schedule) {
			// AvailableScheduleResponse 형태로 변환
			const availableSchedule: AvailableScheduleResponse = {
				id: schedule.id,
				showDateTime: schedule.showDateTime,
				ticketOptions: schedule.ticketOptions.map((option) => ({
					seatGrade: option.seatGrade,
					price: option.price,
					remainingSeats: 10,
				})),
			};

			return HttpResponse.json(availableSchedule);
		}
	}

	return HttpResponse.json(
		{ message: "회차를 찾을 수 없습니다." },
		{ status: 404 },
	);
});

/**
 * 회차 관련 모든 MSW 핸들러
 */
export const scheduleHandlers: HttpHandler[] = [getScheduleHandler];
