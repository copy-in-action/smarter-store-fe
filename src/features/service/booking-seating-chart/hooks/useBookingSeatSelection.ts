/**
 * 예매 좌석 선택 비즈니스 로직을 관리하는 Hook
 * SSE 구독 로직은 useSeatSSESubscription으로 분리
 */
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { MAX_SEAT_SELECTION, useSeatChart } from "@/shared/lib/seat";
import { useSeatSSESubscription } from "./useSeatSSESubscription";

/**
 * 예매 좌석 선택 Hook
 * @param venueId - 공연장 ID
 * @param scheduleId - 회차 ID
 * @returns 좌석 차트 설정 및 예매 전용 제어 함수
 */
export function useBookingSeatSelection(venueId: number, scheduleId: number) {
  const seatChartHook = useSeatChart(venueId, scheduleId);
  const { toggleSeatSelection, seatChartConfig, updateBookingStatus } =
    seatChartHook;

  /**
   * SSE 구독으로 실시간 좌석 상태 업데이트
   */
  useSeatSSESubscription(scheduleId, updateBookingStatus);

  /**
   * 좌석 선택/해제 토글 (최대 4개 제한)
   * @param row - 행 번호
   * @param col - 열 번호
   */
  const toggleSeatSelectionWithLimit = useCallback(
    (row: number, col: number) => {
      if (!seatChartConfig) return;

      const isSelected = seatChartConfig.selectedSeats.some(
        (seat) => seat.row === row && seat.col === col,
      );

      // 선택 추가 시 최대 개수 확인
      if (
        !isSelected &&
        seatChartConfig.selectedSeats.length >= MAX_SEAT_SELECTION
      ) {
        toast.error(
          `최대 ${MAX_SEAT_SELECTION}개의 좌석만 선택할 수 있습니다.`,
          { id: "max-seat-selection-error" },
        );
        return;
      }

      toggleSeatSelection(row, col);
    },
    [seatChartConfig, toggleSeatSelection],
  );

  return {
    ...seatChartHook,
    toggleSeatSelection: toggleSeatSelectionWithLimit,
  };
}
