/**
 * 할인 선택 단계 컴포넌트
 * 책임: 선택된 좌석 표시 (읽기 전용) + 할인 방법 선택 + 결제 진행
 */
"use client";

import { useMemo } from "react";
import {
  transformSeatGradeInfo,
  transformUserSelectedSeats,
} from "../lib/seat-transformers";
import { useCouponsQuery } from "@/entities/coupon";
import type { UserSelectedSeat } from "@/features/booking";
import type { SeatGrade } from "@/shared/api/orval/types";
import { SeatChart } from "@/shared/ui/seat";
import type { SeatChartConfig } from "@/shared/lib/seat.types";
import { transformToGradeInfoArray } from "../lib/transformSeatInfo";
import type { BookingDiscountFormData } from "../model/booking-discount.schema";
import BookingDiscountSelectionForm from "./BookingDiscountSelectionForm";
import LoadingSpinner from "./LoadingSpinner";
import SeatGradePricePopover from "./SeatGradePricePopover";

/**
 * DiscountSelectionStep Props
 */
interface DiscountSelectionStepProps {
  seatChartConfig: SeatChartConfig | null;
  /** 좌석 선택/해제 토글 함수 */
  toggleSeatSelection: (row: number, col: number) => void;
  /** 이전 단계로 돌아가기 핸들러 */
  onBack: () => void;
  /** 할인 선택 완료 핸들러 */
  onComplete: (discountData: BookingDiscountFormData) => Promise<void>;
}

/**
 * 할인 선택 단계 컴포넌트
 * - 선택된 좌석 차트 표시 (읽기 전용)
 * - 등급별 할인 방법 선택 폼
 * - 쿠폰 검증 및 결제 진행
 * @param props - 컴포넌트 Props
 * @returns 할인 선택 단계 UI
 */
const DiscountSelectionStep = ({
  seatChartConfig,
  toggleSeatSelection,
  onBack,
  onComplete,
}: DiscountSelectionStepProps) => {
  const { data: couponData, isLoading: isCouponsLoading } = useCouponsQuery();

  /**
   * 좌석 등급 정보 (가격 팝오버용)
   */
  const seatGradeInfo = useMemo(
    () => transformSeatGradeInfo(seatChartConfig?.seatTypes || {}),
    [seatChartConfig],
  );

  /**
   * 사용자가 선택한 좌석 배열 (등급 순 정렬)
   */
  const userSelectedSeats = useMemo(
    () => transformUserSelectedSeats(seatChartConfig),
    [seatChartConfig],
  );

  /**
   * 등급별로 그룹화된 좌석 정보 배열 생성
   * - userSelectedSeats를 등급별로 그룹화
   * - GradeInfo[] 형태로 변환 (BookingDiscountSelectionForm에 전달용)
   */
  const selectedGradeInfoList = useMemo(() => {
    const selectedSeatInfo = userSelectedSeats.reduce<
      Partial<Record<SeatGrade, UserSelectedSeat[]>>
    >((acc, cur) => {
      const gradeKey = cur.grade as SeatGrade;
      if (!acc[gradeKey]) {
        acc[gradeKey] = [cur];
      } else {
        acc[gradeKey].push(cur);
      }
      return acc;
    }, {});

    return transformToGradeInfoArray(selectedSeatInfo);
  }, [userSelectedSeats]);

  /**
   * 할인 선택 완료 핸들러
   */
  const handleCompleteDiscount = async (
    selectedDiscountInput: BookingDiscountFormData,
  ) => {
    await onComplete(selectedDiscountInput);
  };

  if (seatChartConfig == null || isCouponsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-6 wrapper lg:flex-row">
      {/* 좌석 차트 영역 (읽기 전용) */}
      <section className="relative overflow-auto grow">
        <SeatChart
          config={{
            ...seatChartConfig,
            mode: "payment",
          }}
          onSeatClick={toggleSeatSelection}
        />
        <div className="absolute top-3 end-3">
          <SeatGradePricePopover seatGradeInfo={seatGradeInfo} />
        </div>
      </section>

      {/* 할인 선택 폼 영역 */}
      <section className="lg:w-80 lg:min-w-80">
        {selectedGradeInfoList.length > 0 && (
          <BookingDiscountSelectionForm
            grades={selectedGradeInfoList}
            discountMethods={couponData || []}
            onBackStep={onBack}
            onSubmit={handleCompleteDiscount}
            isLoading={false}
          />
        )}
      </section>
    </div>
  );
};

export default DiscountSelectionStep;
