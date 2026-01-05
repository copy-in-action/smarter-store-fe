/**
 * 예매 UI 상태 관리 Hook
 */
import { useMemo } from "react";
import type { PerformanceResponse, SeatGrade } from "@/shared/api/orval/types";
import {
  transformSeatGradeInfo,
  transformUserSelectedSeats,
} from "../lib/seatTransformer";
import { transformToGradeInfoArray } from "../lib/transformSeatInfo";
import type { UserSelectedSeat } from "../model/booking-seating-chart.types";
import { useBookingSeatSelection } from "./useBookingSeatSelection";

/**
 * 예매 UI에서 사용하는 좌석 선택 상태 및 변환된 데이터를 제공하는 Hook
 * @param performance - 공연 정보
 * @param scheduleId - 회차 ID
 * @returns 좌석 차트 설정, 선택된 좌석 정보, 등급별 좌석 배열 및 제어 함수
 */
export const useBookingUIState = (
  performance: PerformanceResponse,
  scheduleId: number,
) => {
  const { seatChartConfig, toggleSeatSelection, clearSelection } =
    useBookingSeatSelection(performance.venue?.id || 0, scheduleId);

  const seatGradeInfo = useMemo(
    () => transformSeatGradeInfo(seatChartConfig?.seatTypes || {}),
    [seatChartConfig],
  );

  const userSelectedSeats = useMemo(
    () => transformUserSelectedSeats(seatChartConfig),
    [seatChartConfig],
  );

  /**
   * 등급별로 그룹화된 좌석 정보 배열 생성
   * - userSelectedSeats를 등급별로 그룹화
   * - GradeInfo[] 형태로 변환 (BookingDiscountSelectionForm에 전달용)
   */
  const selectedGradeInfoList = useMemo(() => {
    /**
     * 선택된 좌석을 등급별로 그룹화
     * - 각 좌석을 순회하며 등급(grade)을 키로 배열에 추가
     * - 같은 등급의 좌석들을 하나의 배열로 모음
     */
    const selectedSeatInfo = userSelectedSeats.reduce<
      Partial<Record<SeatGrade, UserSelectedSeat[]>>
    >((acc, cur) => {
      const gradeKey = cur.grade as SeatGrade;
      if (!acc[gradeKey]) {
        acc[gradeKey] = [cur];
      } else {
        acc[gradeKey].push(cur);
      }
      return acc;
    }, {});

    return transformToGradeInfoArray(selectedSeatInfo);
  }, [userSelectedSeats]);

  return {
    seatChartConfig,
    seatGradeInfo,
    userSelectedSeats,
    selectedGradeInfoList,
    toggleSeatSelection,
    clearSelection,
  };
};
