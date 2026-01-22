/**
 * 좌석 데이터 변환 유틸리티 (entities layer)
 * - 좌석 관련 모든 변환 로직 중앙 관리
 * - 타입 간 변환 함수 제공
 */

import type { SeatGrade } from "@/shared/api/orval/types";
import { getSeatType } from "@/shared/lib/seat.utils";
import type {
  SeatChartConfig,
  SeatPosition,
  SeatType,
} from "@/shared/lib/seat.types";
import type { GradeInfo, SeatGradeInfo, UserSelectedSeat } from "@/entities/booking";

/**
 * 좌석 등급 정보를 UI 표시용 배열로 변환
 * 용도: 좌석 등급별 가격 팝오버, 범례 표시
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
 * - 높은 좌석 등급 순으로 정렬 (VIP → R → S → A)
 * 용도: 좌석 선택 정보 표시, 가격 계산
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
        section: seat.section,
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

/**
 * 등급별로 그룹화된 좌석 정보를 GradeInfo 배열로 변환
 * 용도: 할인 선택 폼에서 등급별 좌석 수, 가격, 상세 정보 표시
 * @param selectedSeatInfo - 등급별 선택된 좌석 정보
 * @returns 등급별 좌석 정보 배열
 */
export function transformToGradeInfoArray(
  selectedSeatInfo: Partial<Record<SeatGrade, UserSelectedSeat[]>>,
): GradeInfo[] {
  return Object.entries(selectedSeatInfo).map(([grade, seats]) => {
    const firstSeat = seats[0];
    const seatDetails =
      seats.length > 1
        ? `${firstSeat.row + 1}행 ${firstSeat.col + 1}열 외 ${seats.length - 1}건`
        : `${firstSeat.row + 1}행 ${firstSeat.col + 1}열`;

    return {
      grade: grade as SeatGrade,
      seatCount: seats.length,
      basePrice: firstSeat.price,
      seatDetails,
    };
  });
}
