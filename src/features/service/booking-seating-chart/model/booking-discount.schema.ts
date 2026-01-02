/**
 * 예매 할인 선택 폼 스키마
 */
import { z } from "zod";

/**
 * 등급별 선택된 좌석 수에 따른 동적 할인 선택 스키마 생성
 * @param gradeSeatsCount - 등급별 좌석 수 { grade: count }
 * @returns 동적 스키마
 */
export function createBookingDiscountSchema(
  gradeSeatsCount: Record<string, number>,
) {
  /**
   * 각 등급별로 할인 방법 수량 합계가 좌석 수를 초과하지 않는지 검증
   * - 등급별로 선택된 좌석 수만큼만 할인 방법 수량 할당 가능
   * - 예: VIP 3석 선택 시, 일반 2 + 청소년 1 = 3 (OK), 일반 2 + 청소년 2 = 4 (ERROR)
   */
  return z
    .object(
      Object.keys(gradeSeatsCount).reduce(
        (acc, grade) => {
          acc[grade] = z.record(z.string(), z.number().min(0));
          return acc;
        },
        {} as Record<string, z.ZodRecord<z.ZodString, z.ZodNumber>>,
      ),
    )
    .refine(
      (data) => {
        /**
         * 각 등급별로 할인 방법 수량 합계 검증 (초과 방지)
         * - 등급별로 할인 방법 수량의 합이 선택된 좌석 수 이하인지 확인
         */
        return Object.entries(data).every(([grade, discounts]) => {
          const totalQuantity = Object.values(discounts).reduce(
            (sum, qty) => sum + qty,
            0,
          );
          return totalQuantity <= gradeSeatsCount[grade];
        });
      },
      {
        message: "할인 방법 수량의 합이 선택된 좌석 수를 초과할 수 없습니다.",
      },
    )
    .refine(
      (data) => {
        /**
         * 모든 좌석에 할인 방법이 할당되었는지 검증
         * - 등급별로 할인 방법 수량의 합이 정확히 선택된 좌석 수와 일치해야 함
         */
        return Object.entries(data).every(([grade, discounts]) => {
          const totalQuantity = Object.values(discounts).reduce(
            (sum, qty) => sum + qty,
            0,
          );
          return totalQuantity === gradeSeatsCount[grade];
        });
      },
      {
        message: "모든 좌석에 할인 방법을 선택해주세요.",
      },
    );
}

/**
 * 예매 할인 선택 폼 데이터 타입
 */
export type BookingDiscountFormData = z.infer<
  ReturnType<typeof createBookingDiscountSchema>
>;
