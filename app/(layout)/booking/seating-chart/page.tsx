/**
 * 예매하기 좌석 배치도 페이지
 */

import { notFound } from "next/navigation";
import { getPerformanceDetailForServer } from "@/entities/performance/api/performance.server.api";
import BookingSeatingChartView from "@/views/service/booking-seating-chart/BookingSeatingChartView";

/**
 * 페이지 Props
 */
interface Props {
  /** URL 쿼리 파라미터 */
  searchParams: Promise<{
    /** 회차 ID */
    scheduleId: string;
    /** 공연 ID */
    performanceId: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const { performanceId, scheduleId } = await searchParams;

  if (!performanceId || !scheduleId) {
    console.log("No performanceId or scheduleId provided");
    notFound();
  }

  const performance = await getPerformanceDetailForServer(
    Number(performanceId),
  );

  if (!performance) {
    console.log("Seating chart data or performance not found");
    notFound();
  }

  return (
    <BookingSeatingChartView
      performance={performance}
      scheduleId={Number(scheduleId)}
    />
  );
};

export default page;
