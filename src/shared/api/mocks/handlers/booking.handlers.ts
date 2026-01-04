import { addMinutes, formatISO } from "date-fns";
import { type HttpHandler, HttpResponse, http } from "msw";
import type {
	BookingResponse,
	StartBookingRequest,
} from "../../orval/types";
import { mockPerformanceSchedules } from "../data/performance-schedules";

/**
 * 예매 데이터 저장소 (메모리)
 */
const mockBookings: Map<string, BookingResponse> = new Map();

/**
 * 예매 ID 생성 카운터
 */
let bookingIdCounter = 1;

/**
 * 예매 시작 (좌석 점유)
 * POST /api/bookings/start
 */
export const startBookingHandler = http.post(
	"/api/bookings/start",
	async ({ request }) => {
		const body = (await request.json()) as StartBookingRequest;

		// 회차 정보 조회
		let schedule = null;
		for (const schedules of mockPerformanceSchedules.values()) {
			const found = schedules.find((s) => s.id === body.scheduleId);
			if (found) {
				schedule = found;
				break;
			}
		}

		if (!schedule) {
			return HttpResponse.json(
				{ message: "회차를 찾을 수 없습니다." },
				{ status: 404 },
			);
		}

		// 예매 ID 및 번호 생성
		const bookingId = `booking_${bookingIdCounter++}`;
		const bookingNumber = `BK${Date.now().toString().slice(-8)}`;

		// 만료 시간 (5분 후)
		const now = new Date();
		const expiresAt = addMinutes(now, 5);
		const remainingSeconds = 300;

		// 좌석 정보 생성
		const seats = body.seats.map((seat, index) => {
			// 좌석 등급 찾기 (row 기반)
			let grade: "VIP" | "R" | "S" | "A" = "A";
			if (seat.row <= 3) grade = "VIP";
			else if (seat.row <= 6) grade = "R";
			else if (seat.row <= 8) grade = "S";

			// 해당 등급의 가격 찾기
			const ticketOption = schedule!.ticketOptions.find(
				(opt) => opt.seatGrade === grade,
			);
			const price = ticketOption?.price || 0;

			return {
				id: index + 1,
				section: "1층",
				rowName: `${seat.row}열`,
				seatNumber: seat.col,
				grade,
				price,
			};
		});

		// 총 금액 계산
		const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

		// 예매 정보 생성
		const booking: BookingResponse = {
			bookingId,
			bookingNumber,
			expiresAt: formatISO(expiresAt),
			remainingSeconds,
			seats,
			totalPrice,
			status: "PENDING",
		};

		// 저장
		mockBookings.set(bookingId, booking);

		return HttpResponse.json(booking);
	},
);

/**
 * 예매 취소 (좌석 점유 해제)
 * DELETE /api/bookings/:id
 */
export const cancelBookingHandler = http.delete(
	"/api/bookings/:id",
	({ params }) => {
		const bookingId = params.id as string;
		const booking = mockBookings.get(bookingId);

		if (!booking) {
			return HttpResponse.json(
				{ message: "예매를 찾을 수 없습니다." },
				{ status: 404 },
			);
		}

		// 상태 변경
		booking.status = "CANCELLED";
		mockBookings.set(bookingId, booking);

		return HttpResponse.json(booking);
	},
);

/**
 * 예매 관련 모든 MSW 핸들러
 */
export const bookingHandlers: HttpHandler[] = [
	startBookingHandler,
	cancelBookingHandler,
];
