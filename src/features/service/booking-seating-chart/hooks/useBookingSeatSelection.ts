/**
 * 예매 좌석 선택 비즈니스 로직을 관리하는 Hook
 */
"use client";

import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getSubscribeSeatEventsUrl } from "@/shared/api/orval/schedule/schedule";
import { MAX_SEAT_SELECTION, useSeatChart } from "@/shared/lib/seat";
import type { BookingStatusByServer } from "@/shared/lib/seat/types/seatLayout.types";
import { useSeatStatus } from "../api/useSeatStatus";

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
  console.log(
    "🚀 ~ useBookingSeatSelection ~ seatChartConfig:",
    seatChartConfig,
  );

  const { data: seatStatus } = useSeatStatus(scheduleId, {
    enabled: !!seatChartConfig,
  });

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

    /**
     * seat-update 이벤트 수신 시 좌석 상태 업데이트
     */
    eventSource.addEventListener("seat-update", (event: MessageEvent) => {
      try {
        const status: BookingStatusByServer = JSON.parse(event.data);
        updateBookingStatus(status);
      } catch (error) {
        console.error("SSE 메시지 파싱 에러:", error);
      }
    });

    /**
     * SSE 에러 처리
     * - readyState 0 (CONNECTING): 연결 중
     * - readyState 1 (OPEN): 연결됨
     * - readyState 2 (CLOSED): 연결 종료
     */
    eventSource.onerror = (error) => {
      console.error("SSE 연결 에러:", error);
      console.error("EventSource readyState:", eventSource.readyState);

      /**
       * 연결이 닫힌 경우 (CLOSED 상태)
       * - 재연결 시도하지 않고 연결 종료
       */
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("SSE 연결이 닫혔습니다.");
        eventSource.close();
        toast.error("실시간 좌석 상태 업데이트 연결이 종료되었습니다.");
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        /**
         * 연결 실패 또는 에러 발생 (CONNECTING 상태)
         * - EventSource가 자동으로 재연결 시도
         */
        console.log("SSE 재연결 시도 중...");
      }
    };

    return () => {
      console.log("SSE 연결 종료");
      eventSource.close();
    };
  }, [scheduleId, updateBookingStatus]);

  return {
    ...seatChartHook,
    toggleSeatSelection: toggleSeatSelectionWithLimit,
  };
}
