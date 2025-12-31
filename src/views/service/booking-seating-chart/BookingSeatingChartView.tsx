/**
 * 예매 좌석 선택 화면 View 컴포넌트
 */
"use client";

import { useMemo } from "react";
import {
  SeatGradePricePopover,
  SelectSeatInfo,
  useBookingSeatSelection,
} from "@/features/service/booking-seating-chart";
import type { UserSelectedSeat } from "@/features/service/booking-seating-chart/model/booking-seating-chart.types";
import type {
  BookingSeatResponseGrade,
  PerformanceResponse,
} from "@/shared/api/orval/types";
import { getSeatType, SeatChart } from "@/shared/lib/seat";
import { Button } from "@/shared/ui/button";

/**
 * BookingSeatingChartView Props
 */
interface BookingSeatingChartViewProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
  /** 회차 ID */
  scheduleId: number;
}

const BookingSeatingChartView = ({
  performance,
  scheduleId,
}: BookingSeatingChartViewProps) => {
  const { seatChartConfig, toggleSeatSelection, clearSelection } =
    useBookingSeatSelection(performance.venue?.id || 0, scheduleId);

  /**
   * 좌석 등급 정보 계산
   */
  const seatGradeInfo = useMemo(() => {
    const seatTypes = Object.entries(seatChartConfig?.seatTypes || {});
    const seatGradeInfo: { label: string; price: number }[] = [];
    for (const [_, value] of seatTypes) {
      seatGradeInfo.push({ label: value.label, price: value.price || 0 });
    }
    return seatGradeInfo;
  }, [seatChartConfig]);

  /**
   * 사용자가 선택한 좌석 정보 계산
   * 가격 높은 순으로 정렬
   */
  const userSelectedSeats = useMemo(() => {
    const selectedSeats: UserSelectedSeat[] = [];
    if (seatChartConfig == null) {
      return selectedSeats;
    }
    const seatTypes = Object.entries(seatChartConfig?.seatTypes || {});
    const seatGradeInfo: Partial<Record<BookingSeatResponseGrade, number>> = {};
    for (const [_, value] of seatTypes) {
      seatGradeInfo[value.label] = value.price;
    }

    seatChartConfig.selectedSeats.forEach((seat) => {
      const seatType = getSeatType(seat.row, seat.col, seatChartConfig);

      selectedSeats.push({
        row: seat.row,
        col: seat.col,
        grade: seatChartConfig.seatTypes[seatType]?.label || "Unknown",
        price: seatChartConfig.seatTypes[seatType]?.price || 0,
      });
    });

    // 가격 높은 순 정렬
    selectedSeats.sort((a, b) => b.price - a.price);

    return selectedSeats;
  }, [seatChartConfig]);

  if (seatChartConfig == null) {
    return <div>Loading...</div>;
  }
  return (
    <section className="wrapper">
      <h1 className="my-4 text-lg font-bold">
        {performance.title}
        {/* TODO: 구현필요 */}
        <Button className="ms-4" variant={"outline"}>
          일정변경
        </Button>
      </h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="relative overflow-auto grow">
          <SeatChart
            config={seatChartConfig}
            onSeatClick={toggleSeatSelection}
          />
          <div className="absolute top-3 end-3">
            <SeatGradePricePopover seatGradeInfo={seatGradeInfo} />
          </div>
        </div>
        <div className="md:w-80 md:min-w-80">
          <SelectSeatInfo
            userSelectedSeats={userSelectedSeats}
            onClearSelection={clearSelection}
            onToggleSeatSelection={toggleSeatSelection}
          />
        </div>
      </div>
    </section>
  );
};

export default BookingSeatingChartView;
