/**
 * 실시간 좌석 상태 SSE 구독 Hook
 * 책임: SSE 연결, 데이터 파싱, 좌석 상태 변환 및 업데이트
 */
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getSubscribeSeatEventsUrl } from "@/shared/api/orval/schedule/schedule";
import type {
  BookingStatusByServer,
  SeatPosition,
} from "@/shared/lib/seat.types";

/**
 * 실시간 좌석 상태를 SSE로 구독하는 Hook
 * @param scheduleId - 회차 ID
 * @param updateBookingStatus - 좌석 상태 업데이트 함수 (pendingSeats, reservedSeats)
 * @returns SSE 연결 상태
 */
export function useSeatSSESubscription(
  scheduleId: number,
  updateBookingStatus: (
    pendingSeats: SeatPosition[],
    reservedSeats: SeatPosition[],
  ) => void,
) {
  const pendingSeatsRef = useRef<SeatPosition[]>([]);
  const reservedSeatsRef = useRef<SeatPosition[]>([]);

  useEffect(() => {
    if (!scheduleId) return;

    const eventSource = new EventSource(getSubscribeSeatEventsUrl(scheduleId));
    /**
     * 최초 연결 시 전체 좌석 상태 스냅샷 수신
     * - pending: 임시 점유된 좌석
     * - reserved: 예약 완료된 좌석
     */
    eventSource.addEventListener("snapshot", (event: MessageEvent) => {
      try {
        const status: {
          pending: SeatPosition[];
          reserved: SeatPosition[];
        } = JSON.parse(event.data);

        // 서버 인덱스(1-based) → 클라이언트 인덱스(0-based) 변환
        const pendingSeats = status.pending.map((seat) => ({
          row: seat.row - 1,
          col: seat.col - 1,
        }));
        const reservedSeats = status.reserved.map((seat) => ({
          row: seat.row - 1,
          col: seat.col - 1,
        }));

        // ref 업데이트
        pendingSeatsRef.current = pendingSeats;
        reservedSeatsRef.current = reservedSeats;

        // 한 번에 업데이트 (race condition 방지)
        updateBookingStatus(pendingSeats, reservedSeats);
      } catch (error) {
        console.error("SSE snapshot 메시지 파싱 에러:", error);
      }
    });

    /**
     * 실시간 좌석 상태 변경 수신
     * - OCCUPIED: 좌석 점유 (다른 사용자가 선택)
     * - CONFIRMED: 예약 확정 (다른 사용자가 결제 완료)
     * - RELEASED: 좌석 해제 (다른 사용자가 선택 취소)
     */
    eventSource.addEventListener("seat-update", (event: MessageEvent) => {
      try {
        const data: BookingStatusByServer = JSON.parse(event.data);

        // 서버 인덱스(1-based) → 클라이언트 인덱스(0-based) 변환
        const seats = (data.seats as SeatPosition[]).map((seat) => ({
          row: seat.row - 1,
          col: seat.col - 1,
        }));

        let updatedPending = [...pendingSeatsRef.current];
        let updatedReserved = [...reservedSeatsRef.current];

        // 액션별 처리
        if (data.action === "OCCUPIED") {
          // 임시 점유 추가
          updatedPending = [...updatedPending, ...seats];
        } else if (data.action === "CONFIRMED") {
          // 예약 확정 추가
          updatedReserved = [...updatedReserved, ...seats];
        } else if (data.action === "RELEASED") {
          // 임시 점유 해제
          updatedPending = updatedPending.filter(
            (preSeat) =>
              !seats.some(
                (seat) => seat.row === preSeat.row && seat.col === preSeat.col,
              ),
          );
        }

        // ref 업데이트
        pendingSeatsRef.current = updatedPending;
        reservedSeatsRef.current = updatedReserved;

        // 한 번에 업데이트 (race condition 방지)
        updateBookingStatus(updatedPending, updatedReserved);
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
      // cleanup 시 ref 초기화
      pendingSeatsRef.current = [];
      reservedSeatsRef.current = [];
    };
  }, [scheduleId, updateBookingStatus]);
}
