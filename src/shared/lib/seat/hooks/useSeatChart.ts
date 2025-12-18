"use client";

//TODO: 실제 API URL 설정 필요
import { useCallback, useEffect, useState } from "react";
import type {
  BookingStatus,
  SeatChartConfig,
  StaticSeatVenue,
  UserSeatSelection,
} from "../types/seatLayout.types";
import { isSeatInState } from "../utils/seatChart.utils";

/**
 * 좌석 차트 데이터를 관리하는 Hook
 */
export function useSeatChart(venueId: string) {
  const [staticVenue, setStaticVenue] = useState<StaticSeatVenue | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({
    reservedSeats: [],
    pendingSeats: [],
  });
  const [userSelection, setUserSelection] = useState<UserSeatSelection>({
    selectedSeats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 정적 좌석 배치도 로드
   */
  const loadStaticVenue = useCallback(async () => {
    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch(`/api/seat-venues/${venueId}`);
      if (!response.ok) throw new Error("Failed to load seat venue");

      const venue: StaticSeatVenue = await response.json();
      setStaticVenue(venue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load venue");
    }
  }, [venueId]);

  /**
   * 예매 상태 업데이트 (실시간)
   */
  const updateBookingStatus = useCallback((status: BookingStatus) => {
    setBookingStatus(status);
  }, []);

  /**
   * 좌석 선택/해제 토글
   */
  const toggleSeatSelection = (row: number, col: number) => {
    setUserSelection((prev) => {
      const { selectedSeats } = prev;
      const isSelected = isSeatInState(row, col, selectedSeats);

      if (isSelected) {
        // 선택 해제
        return {
          selectedSeats: selectedSeats.filter(
            (seat) => !(seat.row === row && seat.col === col),
          ),
        };
      } else {
        // 선택 추가
        return {
          selectedSeats: [...selectedSeats, { row, col }],
        };
      }
    });
  };

  /**
   * 모든 선택 해제
   */
  const clearSelection = () => {
    setUserSelection({ selectedSeats: [] });
  };

  /**
   * 완전한 좌석 차트 데이터 생성
   */
  const getCompleteSeatChart = (): SeatChartConfig | null => {
    if (!staticVenue) return null;

    return {
      ...staticVenue,
      ...bookingStatus,
      ...userSelection,
      mode: "view" as const,
    };
  };

  // 초기 데이터 로드
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadStaticVenue();
      setIsLoading(false);
    };

    init();
  }, [venueId, loadStaticVenue]);

  // 실시간 예매 상태 구독 (SSE 또는 WebSocket)
  useEffect(() => {
    if (!staticVenue) return;

    // TODO: 실제 SSE/WebSocket 구현
    const eventSource = new EventSource(
      `/api/seat-venues/${venueId}/booking-status`,
    );

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
  }, [venueId, staticVenue, updateBookingStatus]);

  return {
    // 데이터
    staticVenue,
    bookingStatus,
    userSelection,
    seatChartConfig: getCompleteSeatChart(),

    // 상태
    isLoading,
    error,

    // 액션
    toggleSeatSelection,
    clearSelection,
    updateBookingStatus,
  };
}

/**
 * 좌석 상태 유틸리티 Hook
 */
export function useSeatStatus(seatChartConfig: SeatChartConfig | null) {
  /**
   * 좌석의 현재 상태 반환
   */
  const getSeatStatus = (
    row: number,
    col: number,
  ): "available" | "selected" | "reserved" | "pending" | "disabled" => {
    if (!seatChartConfig) return "disabled";

    if (isSeatInState(row, col, seatChartConfig.disabledSeats))
      return "disabled";
    if (isSeatInState(row, col, seatChartConfig.reservedSeats))
      return "reserved";
    if (isSeatInState(row, col, seatChartConfig.pendingSeats)) return "pending";
    if (isSeatInState(row, col, seatChartConfig.selectedSeats))
      return "selected";

    return "available";
  };

  /**
   * 좌석 클릭 가능 여부 확인
   */
  const isSeatClickable = (row: number, col: number): boolean => {
    const status = getSeatStatus(row, col);
    return status === "available" || status === "selected";
  };

  return {
    getSeatStatus,
    isSeatClickable,
  };
}
