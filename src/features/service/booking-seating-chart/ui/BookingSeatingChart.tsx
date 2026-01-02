/**
 * 예매 좌석 배치도 컴포넌트
 */
"use client";

import type { PerformanceResponse } from "@/shared/api/orval/types";
import { SeatChart } from "@/shared/lib/seat";
import { useBookingStepControl } from "../hooks/useBookingStepControl";
import { useBookingUIState } from "../hooks/useBookingUIState";
import BookingDiscountSelectionForm from "./BookingDiscountSelectionForm";
import LoadingSpinner from "./LoadingSpinner";
import SeatGradePricePopover from "./SeatGradePricePopover";
import SelectSeatInfo from "./SelectSeatInfo";

/**
 * 예매 좌석 배치도 Props
 */
interface BookingSeatingChartProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
  /** 회차 ID */
  scheduleId: number;
}

/**
 * 예매 좌석 배치도 및 할인 선택 컴포넌트
 * - Step 1: 좌석 선택 및 좌석 정보 표시
 * - Step 2: 할인 방법 선택 및 결제 진행
 * @param props - 컴포넌트 Props
 * @returns 예매 좌석 배치도 UI
 */
const BookingSeatingChart = ({
  performance,
  scheduleId,
}: BookingSeatingChartProps) => {
  const { step, isLoading, handleCompleteSelection, handleBackStep } =
    useBookingStepControl(scheduleId);

  const {
    seatChartConfig,
    seatGradeInfo,
    userSelectedSeats,
    grades,
    toggleSeatSelection,
    clearSelection,
  } = useBookingUIState(performance, scheduleId);

  /**
   * 좌석 선택 완료 핸들러
   * - userSelectedSeats를 좌석 점유 API 형식으로 변환하여 전달
   */
  const handleSelectComplete = () => {
    if (userSelectedSeats.length === 0) return;

    const seats = userSelectedSeats.map((seat) => ({
      row: seat.row + 1,
      col: seat.col + 1,
    }));

    handleCompleteSelection(seats);
  };

  if (seatChartConfig == null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="relative overflow-auto grow">
        <SeatChart
          config={{
            ...seatChartConfig,
            /**
             * Step에 따른 SeatChart 모드 전환
             * - Step 1 (좌석 선택): view 모드 - 좌석 선택 가능
             * - Step 2 (할인 선택): payment 모드 - 좌석 선택 불가, 확정된 좌석만 표시
             */
            mode: step === 1 ? "view" : "payment",
          }}
          onSeatClick={toggleSeatSelection}
        />
        <div className="absolute top-3 end-3">
          <SeatGradePricePopover seatGradeInfo={seatGradeInfo} />
        </div>
      </div>
      <div className="lg:w-80 lg:min-w-80">
        {step === 1 ? (
          <SelectSeatInfo
            userSelectedSeats={userSelectedSeats}
            onClearSelection={clearSelection}
            onToggleSeatSelection={toggleSeatSelection}
            onComplete={handleSelectComplete}
            isLoading={isLoading}
          />
        ) : (
          <BookingDiscountSelectionForm
            grades={grades}
            onBackStep={handleBackStep}
          />
        )}
      </div>
    </div>
  );
};

export default BookingSeatingChart;
