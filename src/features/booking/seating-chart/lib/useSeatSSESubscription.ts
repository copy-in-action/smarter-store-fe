/**
 * 실시간 좌석 상태 SSE 구독 Hook
 * 책임: SSE 연결 및 좌석 상태 업데이트만 담당
 */
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getSubscribeSeatEventsUrl } from "@/shared/api/orval/schedule/schedule";
import type {
  BookingStatusByServer,
  SeatPosition,
} from "@/shared/lib/seat.types";

/**
 * 실시간 좌석 상태를 SSE로 구독하는 Hook
 * @param scheduleId - 회차 ID
 * @param updateBookingStatus - 좌석 상태 업데이트 함수
 * @returns SSE 연결 상태
 */
export function useSeatSSESubscription(
  scheduleId: number,
  updateBookingStatus: (status: BookingStatusByServer) => void,
) {
  useEffect(() => {
    if (!scheduleId) return;

    const eventSource = new EventSource(getSubscribeSeatEventsUrl(scheduleId));

    /**
     * 최초 연결 시 모든 점유상태를 다 받음 (snapshot 이벤트)
     * - pending: 임시 점유된 좌석
     * - reserved: 예약 완료된 좌석
     */
    eventSource.addEventListener("snapshot", (event: MessageEvent) => {
      try {
        const status: {
          pending: SeatPosition[];
          reserved: SeatPosition[];
        } = JSON.parse(event.data);

        updateBookingStatus({
          action: "OCCUPIED",
          seats: status.pending,
        });
        updateBookingStatus({
          action: "CONFIRMED",
          seats: status.reserved,
        });
      } catch (error) {
        console.error("SSE snapshot 메시지 파싱 에러:", error);
      }
    });

    /**
     * seat-update 이벤트 수신 시 좌석 상태 업데이트
     * - OCCUPIED: 좌석 점유 (다른 사용자가 선택)
     * - RELEASED: 좌석 해제 (다른 사용자가 선택 취소)
     */
    eventSource.addEventListener("seat-update", (event: MessageEvent) => {
      try {
        const status: BookingStatusByServer = JSON.parse(event.data);
        updateBookingStatus(status);
      } catch (error) {
        console.error("SSE seat-update 메시지 파싱 에러:", error);
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
      eventSource.close();
    };
  }, [scheduleId, updateBookingStatus]);
}
