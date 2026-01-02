/**
 * 좌석 정보 변환 유틸리티
 */
import type { BookingSeatResponseGrade } from "@/shared/api/orval/types";
import type {
  GradeInfo,
  UserSelectedSeat,
} from "../model/booking-seating-chart.types";

/**
 * selectedSeatInfo를 GradeInfo 배열로 변환
 * @param selectedSeatInfo - 등급별 선택된 좌석 정보
 * @returns 등급별 좌석 정보 배열
 */
export function transformToGradeInfoArray(
  selectedSeatInfo: Partial<Record<BookingSeatResponseGrade, UserSelectedSeat[]>>,
): GradeInfo[] {
  return Object.entries(selectedSeatInfo).map(([grade, seats]) => {
    const firstSeat = seats[0];
    const seatDetails =
      seats.length > 1
        ? `${firstSeat.row + 1}열 ${firstSeat.col + 1}번 외 ${seats.length - 1}건`
        : `${firstSeat.row + 1}열 ${firstSeat.col + 1}번`;

    return {
      grade,
      seatCount: seats.length,
      basePrice: firstSeat.price,
      seatDetails,
    };
  });
}
