import { addDays, formatISO } from "date-fns";
import type { PerformanceScheduleResponse } from "../../orval/types";

/**
 * 현재 시간 (판매 시작 시간)
 */
const now = new Date();

/**
 * 3일 뒤 날짜
 */
const threeDaysLater = addDays(now, 3);

/**
 * 4일 뒤 날짜
 */
const fourDaysLater = addDays(now, 4);

/**
 * 공연 회차 목 데이터 저장소
 */
export const mockPerformanceSchedules: Map<
  number,
  PerformanceScheduleResponse[]
> = new Map([
  [
    4,
    [
      // 3일 뒤 - 오후 2시
      {
        id: 1,
        showDateTime: formatISO(
          new Date(
            threeDaysLater.getFullYear(),
            threeDaysLater.getMonth(),
            threeDaysLater.getDate(),
            14,
            0,
            0,
          ),
        ),
        saleStartDateTime: formatISO(now),
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
        ticketOptions: [
          { id: 1, seatGrade: "VIP", price: 150000 },
          { id: 2, seatGrade: "R", price: 120000 },
          { id: 3, seatGrade: "S", price: 90000 },
          { id: 4, seatGrade: "A", price: 70000 },
        ],
      },
      // 3일 뒤 - 오후 3시
      {
        id: 2,
        showDateTime: formatISO(
          new Date(
            threeDaysLater.getFullYear(),
            threeDaysLater.getMonth(),
            threeDaysLater.getDate(),
            15,
            0,
            0,
          ),
        ),
        saleStartDateTime: formatISO(now),
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
        ticketOptions: [
          { id: 5, seatGrade: "VIP", price: 150000 },
          { id: 6, seatGrade: "R", price: 120000 },
          { id: 7, seatGrade: "S", price: 90000 },
          { id: 8, seatGrade: "A", price: 70000 },
        ],
      },
      // 3일 뒤 - 오후 4시
      {
        id: 3,
        showDateTime: formatISO(
          new Date(
            threeDaysLater.getFullYear(),
            threeDaysLater.getMonth(),
            threeDaysLater.getDate(),
            16,
            0,
            0,
          ),
        ),
        saleStartDateTime: formatISO(now),
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
        ticketOptions: [
          { id: 9, seatGrade: "VIP", price: 150000 },
          { id: 10, seatGrade: "R", price: 120000 },
          { id: 11, seatGrade: "S", price: 90000 },
          { id: 12, seatGrade: "A", price: 70000 },
        ],
      },
      // 4일 뒤 - 오후 2시
      {
        id: 4,
        showDateTime: formatISO(
          new Date(
            fourDaysLater.getFullYear(),
            fourDaysLater.getMonth(),
            fourDaysLater.getDate(),
            14,
            0,
            0,
          ),
        ),
        saleStartDateTime: formatISO(now),
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
        ticketOptions: [
          { id: 13, seatGrade: "VIP", price: 150000 },
          { id: 14, seatGrade: "R", price: 120000 },
          { id: 15, seatGrade: "S", price: 90000 },
          { id: 16, seatGrade: "A", price: 70000 },
        ],
      },
      // 4일 뒤 - 오후 3시
      {
        id: 5,
        showDateTime: formatISO(
          new Date(
            fourDaysLater.getFullYear(),
            fourDaysLater.getMonth(),
            fourDaysLater.getDate(),
            15,
            0,
            0,
          ),
        ),
        saleStartDateTime: formatISO(now),
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
        ticketOptions: [
          { id: 17, seatGrade: "VIP", price: 150000 },
          { id: 18, seatGrade: "R", price: 120000 },
          { id: 19, seatGrade: "S", price: 90000 },
          { id: 20, seatGrade: "A", price: 70000 },
        ],
      },
    ],
  ],
]);

/**
 * 새로운 스케줄 ID 생성을 위한 카운터
 */
let nextScheduleId = 6;

/**
 * 새로운 티켓 옵션 ID 생성을 위한 카운터
 */
let nextTicketOptionId = 21;

/**
 * 다음 스케줄 ID 반환
 * @returns 다음 스케줄 ID
 */
export const getNextScheduleId = (): number => {
  return nextScheduleId++;
};

/**
 * 다음 티켓 옵션 ID 반환
 * @returns 다음 티켓 옵션 ID
 */
export const getNextTicketOptionId = (): number => {
  return nextTicketOptionId++;
};
