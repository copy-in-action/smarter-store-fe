/**
 * 예매 좌석 선택 비즈니스 로직을 관리하는 Hook
 */
"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { getSubscribeSeatEventsUrl } from "@/shared/api/orval/schedule/schedule";
import type { BookingStatus } from "@/shared/lib/seat";
import { MAX_SEAT_SELECTION, useSeatChart } from "@/shared/lib/seat";

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

  /**
   * 실시간 예매 상태 구독 (SSE)
   */
  useEffect(() => {
    if (!scheduleId) return;

    const eventSource = new EventSource(getSubscribeSeatEventsUrl(scheduleId));

    eventSource.onmessage = (event) => {
      const status: BookingStatus = JSON.parse(event.data);
      updateBookingStatus(status);
    };

    eventSource.onerror = () => {
      console.error("BookingStatus SSE connection error");
    };

    return () => {
      eventSource.close();
    };
  }, [scheduleId, updateBookingStatus]);

  return {
    ...seatChartHook,
    toggleSeatSelection: toggleSeatSelectionWithLimit,
  };
}
