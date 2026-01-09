/**
 * 좌석 선택 단계 컴포넌트
 * 책임: 좌석 차트 표시 + 좌석 선택 + 선택 완료
 */
"use client";

import { useMemo } from "react";
import {
  transformSeatGradeInfo,
  transformUserSelectedSeats,
} from "@/entities/booking";
import type { StartBookingRequest } from "@/shared/api/orval/types";
import { SeatChart, type SeatChartConfig } from "@/shared/lib/seat";
import LoadingSpinner from "./LoadingSpinner";
import SeatGradePricePopover from "./SeatGradePricePopover";
import SelectSeatInfo from "./SelectSeatInfo";

/**
 * SeatSelectionStep Props
 */
interface SeatSelectionStepProps {
  /** 좌석 차트 설정 (부모에서 관리) */
  seatChartConfig: SeatChartConfig | null;
  /** 좌석 선택/해제 토글 함수 */
  toggleSeatSelection: (row: number, col: number) => void;
  /** 선택 초기화 함수 */
  clearSelection: () => void;
  /** 좌석 선택 완료 핸들러 */
  onComplete: (seats: StartBookingRequest["seats"]) => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 좌석 선택 단계 컴포넌트
 * - 좌석 차트 표시
 * - 선택된 좌석 정보 표시
 * - 선택 완료 버튼
 * @param props - 컴포넌트 Props
 * @returns 좌석 선택 단계 UI
 */
const SeatSelectionStep = ({
  seatChartConfig,
  toggleSeatSelection,
  clearSelection,
  onComplete,
  isLoading = false,
}: SeatSelectionStepProps) => {
  /**
   * 좌석 등급 정보 (가격 팝오버용)
   */
  const seatGradeInfo = useMemo(
    () => transformSeatGradeInfo(seatChartConfig?.seatTypes || {}),
    [seatChartConfig],
  );

  /**
   * 사용자가 선택한 좌석 배열 (등급 순 정렬)
   */
  const userSelectedSeats = useMemo(
    () => transformUserSelectedSeats(seatChartConfig),
    [seatChartConfig],
  );

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

    onComplete(seats);
  };

  if (seatChartConfig == null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-6 wrapper lg:flex-row">
      {/* 좌석 차트 영역 */}
      <section className="relative overflow-auto grow">
        <SeatChart
          config={{
            ...seatChartConfig,
            mode: "view",
          }}
          onSeatClick={toggleSeatSelection}
        />
        <div className="absolute top-3 end-3">
          <SeatGradePricePopover seatGradeInfo={seatGradeInfo} />
        </div>
      </section>

      {/* 선택 좌석 정보 영역 */}
      <section className="lg:w-80 lg:min-w-80">
        <SelectSeatInfo
          userSelectedSeats={userSelectedSeats}
          onClearSelection={clearSelection}
          onToggleSeatSelection={toggleSeatSelection}
          onComplete={handleSelectComplete}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default SeatSelectionStep;
