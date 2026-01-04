import type { SeatingChartResponse } from "../../orval/types";

/**
 * 좌석 배치도 목 데이터
 * venueId: 2 (샬롯데씨어터)
 */
export const mockSeatingCharts: Map<number, SeatingChartResponse> = new Map([
  [
    2, // venueId: 2 (샬롯데씨어터)
    {
      venueId: 2,
      seatingChart: {
        rows: 10,
        columns: 20,
        seatTypes: {
          VIP: {
            price: 150000,
            positions: ["1:", "2:", "3:"], // 1-3행 전체
          },
          R: {
            price: 120000,
            positions: ["4:", "5:", "6:"], // 4-6행 전체
          },
          S: {
            price: 90000,
            positions: ["7:", "8:"], // 7-8행 전체
          },
          A: {
            price: 70000,
            positions: ["9:", "10:"], // 9-10행 전체
          },
        },
        disabledSeats: [], // 비활성화된 좌석 없음
        rowSpacers: [], // 행 간격 없음
        columnSpacers: [10], // 10열 뒤에 통로
      },
      seatCapacities: [
        {
          id: 1,
          venueId: 2,
          seatGrade: "VIP",
          capacity: 60, // 3행 × 20열
        },
        {
          id: 2,
          venueId: 2,
          seatGrade: "R",
          capacity: 60, // 3행 × 20열
        },
        {
          id: 3,
          venueId: 2,
          seatGrade: "S",
          capacity: 40, // 2행 × 20열
        },
        {
          id: 4,
          venueId: 2,
          seatGrade: "A",
          capacity: 40, // 2행 × 20열
        },
      ],
    },
  ],
]);
