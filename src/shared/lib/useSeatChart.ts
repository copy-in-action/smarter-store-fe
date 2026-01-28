"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getSchedule } from "@/shared/api/orval/schedule/schedule";
import type { SeatGrade } from "@/shared/api/orval/types";
import { getSeatingChart } from "@/shared/api/orval/venue/venue";
import type {
  BookingStatus,
  BookingStatusByServer,
  SeatChartConfig,
  SeatPosition,
  StaticSeatVenue,
  UserSeatSelection,
} from "./seat.types";
import { isSeatInState } from "./seat.utils";

/**
 * 좌석 차트 데이터를 관리하는 Hook (범용)
 * @param venueId - 공연장 ID
 * @param scheduleId - 회차 ID (옵셔널, 제공 시 가격 정보 로드)
 * @returns 좌석 차트 설정 및 제어 함수
 */
export function useSeatChart(
  venueId: number,
  mode: "view" | "payment",
  scheduleId?: number,
) {
  const [staticVenue, setStaticVenue] = useState<StaticSeatVenue | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({
    reservedSeats: [],
    pendingSeats: [],
  });
  const [userSelection, setUserSelection] = useState<UserSeatSelection>({
    selectedSeats: [],
  });

  /**
   * 좌석 배치도 조회 쿼리
   */
  const {
    data: seatingChartData,
    isLoading: isLoadingSeatingChart,
    error: seatingChartError,
  } = useQuery({
    queryKey: ["seatingChart", venueId],
    queryFn: async () => {
      const response = await getSeatingChart(venueId);
      if (response.status === 404) {
        throw new Error("좌석 배치도를 찾을 수 없습니다.");
      }
      return response.data;
    },
    enabled: !!venueId,
  });

  /**
   * 회차 정보 조회 쿼리 (가격 정보 포함)
   */
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    error: scheduleError,
  } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return null;
      const response = await getSchedule(scheduleId);
      if (response.status === 404) {
        throw new Error("회차 정보를 찾을 수 없습니다.");
      }
      return response.data;
    },
    enabled: !!scheduleId,
  });

  /**
   * 좌석 배치도와 가격 정보를 조합하여 staticVenue 설정
   */
  useEffect(() => {
    if (!seatingChartData?.seatingChart) return;

    const seatingChart =
      seatingChartData.seatingChart as unknown as StaticSeatVenue;

    // scheduleId가 있고 가격 정보가 로드되었을 때만 가격 업데이트
    if (scheduleId && scheduleData) {
      Object.entries(seatingChart.seatTypes).forEach(([type]) => {
        const findOption = scheduleData.ticketOptions.find(
          (option) => option.seatGrade === type,
        );

        const seatType = seatingChart.seatTypes[type as SeatGrade];
        if (seatType) {
          seatType.price = findOption ? findOption.price : 0;
        }
      });
    }

    setStaticVenue(seatingChart);
  }, [seatingChartData, scheduleData, scheduleId]);

  /**
   * 예매 상태 업데이트 (단순 setter)
   * @param pendingSeats - 임시 점유 좌석
   * @param reservedSeats - 예약 확정 좌석
   */
  const updateBookingStatus = useCallback(
    (pendingSeats: SeatPosition[], reservedSeats: SeatPosition[]) => {
      setBookingStatus({ pendingSeats, reservedSeats });

      // 사용자 선택 좌석과 충돌 체크 (view 모드만)
      if (mode === "view") {
        setUserSelection((prevSelection) => {
          const allConflictSeats = [...pendingSeats, ...reservedSeats];
          const conflictingSeats = prevSelection.selectedSeats.filter(
            (selected) =>
              allConflictSeats.some(
                (seat) =>
                  seat.row === selected.row && seat.col === selected.col,
              ),
          );

          if (conflictingSeats.length > 0) {
            conflictingSeats.forEach((seat) => {
              toast.error(
                `선택하신 ${seat.row + 1}행 ${seat.col + 1}열 좌석이 다른 사용자에 의해 예매되었습니다.`,
                { id: "seating-chart-error" },
              );
            });

            return {
              selectedSeats: prevSelection.selectedSeats.filter(
                (selected) =>
                  !allConflictSeats.some(
                    (seat) =>
                      seat.row === selected.row && seat.col === selected.col,
                  ),
              ),
            };
          }
          return prevSelection;
        });
      }
    },
    [mode],
  );

  /**
   * 좌석 선택/해제 토글 (제한 없음)
   * @param row - 행 번호
   * @param col - 열 번호
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
  const clearSelection = useCallback(() => {
    setUserSelection({ selectedSeats: [] });
  }, []);

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

  /**
   * 전체 로딩 상태 (좌석 배치도 + 회차 정보)
   */
  const isLoading = scheduleId
    ? isLoadingSeatingChart || isLoadingSchedule
    : isLoadingSeatingChart;

  /**
   * 전체 에러 상태
   */
  const error = seatingChartError || scheduleError;

  return {
    // 데이터
    staticVenue,
    bookingStatus,
    userSelection,
    seatChartConfig: getCompleteSeatChart(),

    // 상태
    isLoading,
    error: error ? String(error) : null,

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
