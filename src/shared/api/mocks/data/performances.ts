import { formatISO } from "date-fns";
import type { PerformanceResponse } from "../../orval/types";

/**
 * 공연 정보 목 데이터
 */
export const mockPerformances: Map<number, PerformanceResponse> = new Map([
	[
		4,
		{
			id: 4,
			title: "뮤지컬 오페라의 유령",
			description:
				"전 세계를 감동시킨 앤드류 로이드 웨버의 불멸의 명작. 파리 오페라 하우스를 배경으로 펼쳐지는 환상적인 사랑 이야기",
			category: "뮤지컬",
			runningTime: 150,
			ageRating: "8세 이상",
			mainImageUrl: "/images/phantom-main.jpg",
			visible: true,
			venue: {
				id: 1,
				name: "샬롯데씨어터",
				address: "서울특별시 송파구 올림픽로 240",
				phoneNumber: "02-1234-5678",
				hasSeatingChart: true,
				createdAt: formatISO(new Date("2025-01-01")),
				updatedAt: formatISO(new Date("2025-01-01")),
			},
			startDate: "2026-01-06",
			endDate: "2026-03-31",
			actors: "홍광호, 김소현, 최재림, 신영숙",
			agency: "EMK뮤지컬컴퍼니",
			producer: "EMK뮤지컬컴퍼니",
			host: "샬롯데씨어터",
			discountInfo:
				"조기예매 할인 20%, 학생 할인 15%, 단체 할인(10인 이상) 10%",
			usageGuide:
				"공연 시작 30분 전부터 입장 가능합니다.\n미취학 아동은 입장이 불가능합니다.\n공연 중 사진 촬영 및 녹음은 금지됩니다.",
			refundPolicy:
				"관람일 기준 10일 전까지 전액 환불\n관람일 기준 9~7일 전까지 90% 환불\n관람일 기준 6~3일 전까지 80% 환불\n관람일 기준 2일~1일 전까지 70% 환불\n관람 당일 환불 불가",
			detailImageUrl: "/images/phantom-detail.jpg",
			company: {
				id: 1,
				name: "EMK뮤지컬컴퍼니",
				businessNumber: "123-45-67890",
			},
			bookingFee: 1000,
			shippingGuide: "모바일 티켓으로 발권됩니다. 별도의 배송은 없습니다.",
			createdAt: formatISO(new Date("2025-12-01")),
			updatedAt: formatISO(new Date("2025-12-15")),
		},
	],
]);
