import type { StaticSeatVenue } from "@/shared/lib/seat/types/seatLayout.types";

/**
 * 기본 좌석 배치도 설정을 반환합니다
 * @returns 기본 좌석 배치도 설정
 */
export function getDefaultSeatingChart(): StaticSeatVenue {
  return {
    rows: 10,
    columns: 20,
    seatTypes: {
      B: {
        positions: ["1:"],
      },
    },
    disabledSeats: [],
    rowSpacers: [],
    columnSpacers: [],
  };
}
