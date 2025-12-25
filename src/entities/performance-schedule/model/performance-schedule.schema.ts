import { z } from "zod";
import type { VenueSeatCapacityRequest } from "@/shared/api/orval/types";

/**
 * 공연 회차 생성을 위한 동적 스키마 생성 함수
 * @param seatGrades - 공연장의 좌석 등급 배열
 */
export const createPerformanceScheduleSchema = (
  seatGrades: VenueSeatCapacityRequest[],
) => {
  const availableGrades = seatGrades.map((seat) => seat.seatGrade);

  return z
    .object({
      /** 공연 날짜 및 시간 (ISO string) */
      showDateTime: z.string().min(1, "공연 시간을 선택해주세요"),
      /** 티켓 판매 시작 일시 (ISO string) */
      saleStartDateTime: z.string().min(1, "판매 시작 시간을 선택해주세요"),
      /** 회차별 티켓 가격 옵션 목록 */
      ticketOptions: z
        .array(
          z.object({
            /** 좌석 등급 (동적) */
            seatGrade: z.enum(availableGrades as [string, ...string[]], {
              message: "유효한 좌석 등급을 선택해주세요",
            }),
            /** 가격 */
            price: z.number().min(0, "가격은 0 이상이어야 합니다"),
          }),
        )
        .min(1, "최소 하나의 티켓 옵션이 필요합니다"),
    })
    .refine(
      (data) => {
        const showDate = new Date(data.showDateTime);
        const saleStartDate = new Date(data.saleStartDateTime);
        const now = new Date();

        // 둘 다 미래 시간이어야 함
        if (showDate <= now || saleStartDate <= now) {
          return false;
        }

        // 공연 시작일이 판매 시작일보다 나중이어야 함
        if (showDate <= saleStartDate) {
          return false;
        }

        return true;
      },
      {
        message:
          "공연 시간과 판매 시작 시간은 현재 시간보다 미래여야 하며, 공연 시간이 판매 시작 시간보다 나중이어야 합니다",
        path: ["showDateTime"],
      },
    );
};

/**
 * 공연 회차 생성 폼 데이터 타입 (동적 스키마 기반)
 */
export type CreatePerformanceScheduleFormInput = z.input<
  ReturnType<typeof createPerformanceScheduleSchema>
>;
export type CreatePerformanceScheduleFormData = z.output<
  ReturnType<typeof createPerformanceScheduleSchema>
>;
