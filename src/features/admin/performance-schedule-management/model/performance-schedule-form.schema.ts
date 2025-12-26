import { z } from "zod";
import { createPerformanceScheduleSchema } from "@/entities/performance-schedule/model/performance-schedule.schema";
import type { VenueSeatCapacityRequest } from "@/shared/api/orval/types";

/**
 * 관리자 공연 회차 관리 폼 스키마 생성 함수
 * entities 스키마를 상속하여 폼 특화 로직을 추가합니다
 * @param seatGrades - 공연장의 좌석 등급 배열
 */
export const createPerformanceScheduleFormSchema = (
  seatGrades: VenueSeatCapacityRequest[],
) => {
  const baseSchema = createPerformanceScheduleSchema(seatGrades);
  const availableGrades = seatGrades.map((seat) => seat.seatGrade);

  // 폼 특화 스키마: 문자열 → 숫자 변환 및 추가 검증
  return baseSchema.extend({
    /** 회차별 티켓 가격 옵션 목록 */
    ticketOptions: z
      .array(
        z.object({
          /** 좌석 등급 (동적) */
          seatGrade: z.enum(availableGrades, {
            message: "유효한 좌석 등급을 선택해주세요",
          }),
          /** 가격 (필수값, 1원 이상) */
          price: z
            .number()
            .min(1, "가격은 1원 이상 입력해주세요")
            .positive("가격은 양수여야 합니다"),
        }),
      )
      .min(1, "최소 하나의 티켓 옵션이 필요합니다")
      .refine(
        (options) => {
          // 중복 좌석 등급 검증
          const grades = options.map((option) => option.seatGrade);
          const uniqueGrades = new Set(grades);
          return grades.length === uniqueGrades.size;
        },
        {
          message: "중복된 좌석 등급이 있습니다",
        },
      ),
  });
};

/**
 * 관리자 공연 회차 폼 데이터 타입
 */
export type CreatePerformanceScheduleFormInput = z.input<
  ReturnType<typeof createPerformanceScheduleFormSchema>
>;
export type CreatePerformanceScheduleFormData = z.output<
  ReturnType<typeof createPerformanceScheduleFormSchema>
>;

// 호환성 유지를 위한 별칭
export const performanceScheduleFormSchema =
  createPerformanceScheduleFormSchema;
export type PerformanceScheduleFormInput = CreatePerformanceScheduleFormInput;
export type PerformanceScheduleFormData = CreatePerformanceScheduleFormData;
