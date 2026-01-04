import { type HttpHandler, HttpResponse, http } from "msw";
import { mockPerformances } from "../data/performances";

/**
 * 공연 상세 정보 조회
 * GET /api/performances/:id
 */
export const getPerformanceHandler = http.get(
	"/api/performances/:id",
	({ params }) => {
		const performanceId = Number(params.id);
		const performance = mockPerformances.get(performanceId);

		if (!performance) {
			return HttpResponse.json(
				{ message: "공연을 찾을 수 없습니다." },
				{ status: 404 },
			);
		}

		return HttpResponse.json(performance);
	},
);

/**
 * 공연 관련 모든 MSW 핸들러
 */
export const performanceHandlers: HttpHandler[] = [getPerformanceHandler];
