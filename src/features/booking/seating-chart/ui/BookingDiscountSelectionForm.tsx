/**
 * 예매 할인 선택 폼 컴포넌트
 * - 등급별 좌석에 대한 할인 방법 및 수량 선택
 * - 실시간 최종 금액 계산
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type {
  AvailableCouponResponse,
  SeatGrade,
} from "@/shared/api/orval/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { type  GradeInfo } from "@/entities/booking";
import { useBookingStepStore } from "@/features/booking";
import {
  type BookingDiscountFormData,
  createBookingDiscountSchema,
} from "../model/booking-discount.schema";

/**
 * 예매 할인 선택 폼 Props
 */
export interface BookingDiscountSelectionFormProps {
  /** 등급별 좌석 정보 배열 */
  grades: GradeInfo[];
  /** 할인 방법 목록 (API로부터 받음, 없으면 기본값 사용) */
  discountMethods: AvailableCouponResponse[];
  /** 폼 제출 핸들러 */
  onSubmit?: (selectedDiscountInput: BookingDiscountFormData) => void;
  /** 이전 Step으로 돌아가기 핸들러 */
  onBackStep: () => void;
  /** 쿠폰 검증 중 여부 */
  isLoading?: boolean;
}

/**
 * 예매 할인 선택 폼 컴포넌트
 * - 등급별 좌석에 대해 할인 방법과 수량을 선택
 * - Zod 동적 스키마로 "모든 좌석에 할인 방법 할당" 검증
 * - 실시간 최종 금액 계산 및 표시
 * @param props - 컴포넌트 Props
 * @returns 예매 할인 선택 폼 UI
 */
const BookingDiscountSelectionForm = ({
  grades,
  discountMethods,
  onSubmit,
  onBackStep,
  isLoading = false,
}: BookingDiscountSelectionFormProps) => {
  // 스토어에서 selectedDiscountInput을 가져옴 (새로고침 시 복원용)
  const { selectedDiscountInput } = useBookingStepStore();

  /**
   * 등급별 좌석 수 Map 생성 (스키마용)
   */
  const gradeSeatsCount = useMemo(
    () => Object.fromEntries(grades.map((g) => [g.grade, g.seatCount])),
    [grades],
  );

  /**
   * 동적 스키마 생성
   */
  const schema = useMemo(
    () => createBookingDiscountSchema(gradeSeatsCount),
    [gradeSeatsCount],
  );

  /**
   * 폼 초기값 생성
   * - 스토어에 저장된 selectedDiscountInput이 있다면 복원하고, 없으면 기본값 사용
   */
  const defaultValues = useMemo(() => {
    if (selectedDiscountInput) {
      // 스토어에 저장된 값이 있으면 해당 값으로 초기화
      return selectedDiscountInput;
    }

    // 없으면 기존 로직대로 기본값 생성 (모든 좌석을 "일반" 할인에 할당)
    return Object.fromEntries(
      grades.map((g) => [
        g.grade,
        Object.fromEntries(discountMethods.map((m) => [String(m.id), 0])),
      ]),
    ) as BookingDiscountFormData;
  }, [grades, discountMethods, selectedDiscountInput]); // selectedDiscountInput을 의존성 배열에 추가

  /**
   * React Hook Form 초기화
   */
  const form = useForm<BookingDiscountFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  /**
   * 폼 값 감시 (최종 금액 계산용)
   */
  const formValues = useWatch({ control: form.control });

  /**
   * 등급별 선택된 총 수량 계산
   * @param grade - 좌석 등급
   * @returns 해당 등급의 할인 방법 수량 합계
   */
  const getGradeTotalQuantity = (grade: string) => {
    const gradeDiscounts = formValues[grade] || {};
    return Object.values(gradeDiscounts).reduce(
      (sum = 0, qty) => sum + (qty || 0),
      0,
    );
  };

  /**
   * 최종 티켓 금액 계산
   * - 각 등급/할인 방법별 수량 * (원가 * (1 - 할인율)) 합계
   */
  const totalPrice = useMemo(() => {
    const total = grades.reduce((sum, gradeInfo) => {
      const gradeDiscounts = formValues[gradeInfo.grade] || {};

      return (
        sum +
        discountMethods.reduce((gradeSum, method) => {
          const quantity = gradeDiscounts[String(method.id)] || 0; // Ensure key is string
          const discountedPrice =
            gradeInfo.basePrice * (1 - method.discountRate / 100);
          return gradeSum + quantity * discountedPrice;
        }, 0)
      );
    }, 0);

    return Math.floor(total);
  }, [grades, formValues, discountMethods]);

  /**
   * 수량 증가/감소 핸들러
   * @param grade - 좌석 등급
   * @param discountId - 할인 방법 ID
   * @param delta - 증감값 (+1 or -1)
   */
  const handleQuantityChange = (
    grade: string,
    discountId: number, // Change to number
    delta: number,
  ) => {
    const currentValue = form.getValues(`${grade}.${discountId}`) || 0;
    const newValue = Math.max(0, currentValue + delta);
    form.setValue(`${grade}.${discountId}`, newValue, {
      shouldValidate: true,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit?.(data);
        })}
        className="flex flex-col justify-between h-full"
      >
        <h2>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={onBackStep}
            type="button"
          >
            <ChevronLeft />
          </Button>
          가격선택
        </h2>

        <Accordion type="multiple" defaultValue={grades.map((g) => g.grade)}>
          {grades.map((gradeInfo) => {
            const totalQuantity = getGradeTotalQuantity(gradeInfo.grade);

            return (
              <AccordionItem value={gradeInfo.grade} key={gradeInfo.grade}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-lg font-bold">
                    <div className="w-24">
                      {gradeInfo.grade}석 {totalQuantity}/{gradeInfo.seatCount}
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                      {gradeInfo.seatDetails}
                    </p>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-2">
                  {discountMethods.map((method) => {
                    const discountedPrice = Math.floor(
                      gradeInfo.basePrice * (1 - method.discountRate / 100),
                    );

                    return (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name={`${gradeInfo.grade}.${method.id}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between p-4 rounded bg-gray-50">
                              <div>
                                <p className="mb-0.5 text-sm">
                                  {method.name}{" "}
                                  {method.discountRate > 0 && (
                                    <span className="ml-1 text-xs text-red-500">
                                      ({method.discountRate}% 할인)
                                    </span>
                                  )}
                                </p>
                                <p className="font-bold">
                                  {discountedPrice.toLocaleString()}원
                                </p>
                              </div>

                              <FormControl>
                                <div className="flex items-center justify-center gap-0.5">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="p-1! bg-white border rounded-full h-auto"
                                    onClick={() =>
                                      handleQuantityChange(
                                        gradeInfo.grade,
                                        method.id,
                                        -1,
                                      )
                                    }
                                    disabled={field.value === 0}
                                  >
                                    <Minus className="size-4" />
                                  </Button>

                                  <span className="min-w-[1rem] text-center font-semibold">
                                    {field.value || 0}
                                  </span>

                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="p-1! bg-white border rounded-full h-auto"
                                    onClick={() =>
                                      handleQuantityChange(
                                        gradeInfo.grade,
                                        method.id,
                                        1,
                                      )
                                    }
                                    disabled={
                                      field.value === gradeInfo.seatCount ||
                                      getGradeTotalQuantity(gradeInfo.grade) ===
                                        gradeInfo.seatCount
                                    }
                                  >
                                    <Plus className="size-4" />
                                  </Button>
                                </div>
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <FormMessage>{form.formState.errors.root?.message}</FormMessage>

        {/* 최종 금액 및 예매하기 버튼 */}
        <div className="flex justify-between pt-2 mt-auto ps-1 lg:pt-0">
          <div>
            <p className="text-xs text-gray-400">티켓 금액</p>
            <p className="text-xl font-bold">{totalPrice.toLocaleString()}원</p>
          </div>

          <Button
            size="lg"
            type="submit"
            disabled={!form.formState.isValid || isLoading}
          >
            {isLoading ? "검증 중..." : "예매하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingDiscountSelectionForm;
