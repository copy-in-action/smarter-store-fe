/**
 * 좌석 데이터 변환 유틸리티
 */
import type { SeatGrade } from "@/shared/api/orval/types";
import {
  getSeatType,
  type SeatChartConfig,
  type SeatPosition,
  type SeatType,
} from "@/shared/lib/seat";
import type { SeatGradeInfo, UserSelectedSeat } from "../../booking-process";

/**
 * 좌석 등급 정보를 UI 표시용 배열로 변환
 * @param seatTypes - 등급별 좌석 타입 정보
 * @returns 좌석 등급 정보 배열
 */
export const transformSeatGradeInfo = (
  seatTypes: Partial<Record<SeatGrade, SeatType>>,
): SeatGradeInfo[] => {
  return Object.entries(seatTypes).map(([key, value]) => ({
    label: key,
    price: value.price || 0,
  }));
};

/**
 * 선택된 좌석 정보를 사용자 표시용 배열로 변환
 * - 좌석 등급과 가격 정보 추가
 * - 높은 좌석 등급 순으로 정렬
 * @param seatChartConfig - 좌석 차트 설정
 * @returns 사용자 선택 좌석 배열 (높은 좌석 등급 순으로 정렬)
 */
export const transformUserSelectedSeats = (
  seatChartConfig: SeatChartConfig | null,
): UserSelectedSeat[] => {
  if (!seatChartConfig) return [];
  /** 등급별 정렬 우선순위 */
  const gradeOrder = { VIP: 0, R: 1, S: 2, A: 3 };
  const selectedSeats = seatChartConfig.selectedSeats.map(
    (seat: SeatPosition) => {
      const seatType = getSeatType(seat.row, seat.col, seatChartConfig);

      return {
        row: seat.row,
        col: seat.col,
        grade: seatType || "Unknown",
        price: seatChartConfig.seatTypes[seatType]?.price || 0,
      };
    },
  );

  return selectedSeats.sort((a, b) => {
    const orderA = gradeOrder[a.grade as keyof typeof gradeOrder] ?? 999;
    const orderB = gradeOrder[b.grade as keyof typeof gradeOrder] ?? 999;
    return orderA - orderB;
  });
};
