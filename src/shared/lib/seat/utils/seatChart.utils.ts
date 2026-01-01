import type { BookingSeatResponseGrade } from "@/shared/api/orval/types";
import type { SeatChartConfig, SeatPosition } from "../types/seatLayout.types";

/**
 * 좌석 차트 관련 유틸리티 함수들
 */

/**
 * 좌석이 특정 상태 배열에 포함되어 있는지 확인
 * @param row - 행 번호
 * @param col - 열 번호
 * @param seats - 좌석 위치 배열
 * @returns 포함 여부
 */
export const isSeatInState = (
  row: number,
  col: number,
  seats: SeatPosition[],
): boolean => {
  return seats.some((seat) => seat.row === row && seat.col === col) || false;
};

/**
 * 좌석의 타입을 결정하는 함수
 * @param row - 행 번호 (0부터 시작)
 * @param col - 열 번호 (0부터 시작)
 * @param config - 좌석 차트 설정
 * @returns 좌석 타입 키
 */
export const getSeatType = (
  row: number,
  col: number,
  config: SeatChartConfig,
): BookingSeatResponseGrade => {
  // 각 좌석 타입의 positions를 확인 (구체적인 것부터 확인)
  for (const [seatTypeKey, seatType] of Object.entries(config.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // "3:5" 형태 - 3행 5열 (가장 구체적이므로 우선 확인)
      if (
        rowPart &&
        colPart &&
        Number(rowPart) - 1 === row &&
        Number(colPart) - 1 === col
      ) {
        return seatTypeKey as BookingSeatResponseGrade;
      }
    }
  }

  // 행 전체 매칭 확인
  for (const [seatTypeKey, seatType] of Object.entries(config.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // "3:" 형태 - 3행 전체
      if (rowPart && !colPart && Number(rowPart) - 1 === row) {
        return seatTypeKey as BookingSeatResponseGrade;
      }
    }
  }

  // 열 전체 매칭 확인
  for (const [seatTypeKey, seatType] of Object.entries(config.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // ":5" 형태 - 5열 전체
      if (!rowPart && colPart && Number(colPart) - 1 === col) {
        return seatTypeKey as BookingSeatResponseGrade;
      }
    }
  }

  // 기본값: 마지막 좌석 타입 반환
  const seatTypeKeys = Object.keys(config.seatTypes);
  return (
    (seatTypeKeys[seatTypeKeys.length - 1] as BookingSeatResponseGrade) || "B"
  );
};

/**
 * SeatPosition 객체를 문자열로 변환
 * @param seat - 좌석 위치 객체
 * @returns "행,열" 형식의 문자열
 */
export const seatPositionToString = (seat: SeatPosition): string => {
  return `${seat.row},${seat.col}`;
};

/**
 * 좌석 위치 문자열의 유효성을 검사
 * @param position - "행,열" 형식의 문자열
 * @param config - 좌석 차트 설정
 * @returns 유효성 여부
 */
export const validateSeatPosition = (
  position: string,
  config: SeatChartConfig,
): boolean => {
  const [row, col] = position.split(",").map(Number);
  return (
    !isNaN(row) &&
    !isNaN(col) &&
    row >= 0 &&
    col >= 0 &&
    row < config.rows &&
    col < config.columns
  );
};
