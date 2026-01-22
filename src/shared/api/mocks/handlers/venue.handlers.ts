import { type HttpHandler, HttpResponse, http } from "msw";
import { mockSeatingCharts } from "../data/seating-charts";

/**
 * 공연장 좌석 배치도 조회
 * GET /api/venues/:id/seating-chart
 */
export const getSeatingChartHandler = http.get(
	"/api/venues/:id/seating-chart",
	({ params }) => {
		const venueId = Number(params.id);
		const seatingChart = mockSeatingCharts.get(venueId);

		if (!seatingChart) {
			return HttpResponse.json(
				{ message: "좌석 배치도를 찾을 수 없습니다." },
				{ status: 404 },
			);
		}

		return HttpResponse.json(seatingChart);
	},
);

/**
 * 공연장 관련 모든 MSW 핸들러
 */
export const venueHandlers: HttpHandler[] = [getSeatingChartHandler];
