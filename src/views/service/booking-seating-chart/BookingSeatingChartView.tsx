/**
 * 예매 좌석 배치도 View
 */
"use client";

import { BookingSeatingChart } from "@/features/service/booking-seating-chart";
import type { PerformanceResponse } from "@/shared/api/orval/types";

/**
 * 예매 좌석 배치도 뷰 Props
 */
interface BookingSeatingChartViewProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
  /** 회차 ID */
  scheduleId: number;
}

/**
 * 예매 좌석 배치도 View 컴포넌트
 * - 좌석 배치도와 예매 프로세스 표시
 * - 헤더는 BookingLayout에서 처리
 * @param props - 컴포넌트 Props
 * @returns 예매 좌석 배치도 뷰 UI
 */
const BookingSeatingChartView = ({
  performance,
  scheduleId,
}: BookingSeatingChartViewProps) => {
  return (
    <BookingSeatingChart performance={performance} scheduleId={scheduleId} />
  );
};

export default BookingSeatingChartView;
