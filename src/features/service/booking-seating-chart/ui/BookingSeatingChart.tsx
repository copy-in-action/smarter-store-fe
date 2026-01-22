/**
 * 예매 좌석 배치도 Orchestrator 컴포넌트
 * 책임: Step에 따라 적절한 하위 컴포넌트 표시
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { transformUserSelectedSeats } from "@/entities/booking";
import { useCouponsQuery, useValidateCoupons } from "@/entities/coupon";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import {
  BookingStep,
  type SeatTotalInfo,
  useBookingStepStore,
} from "../../booking-process";
import { useBookingSeatSelection } from "../lib/useBookingSeatSelection";
import { useBookingStepControl } from "../lib/useBookingStepControl";
import { createPaymentConfirmationData } from "../lib/createPaymentConfirmationData";
import { createPaymentRequestData } from "../lib/createPaymentRequestData";
import { transformToSeatCoupons } from "../lib/transform-booking-discount";
import type { BookingDiscountFormData } from "../model/booking-discount.schema";
import DiscountSelectionStep from "./DiscountSelectionStep";
import SeatSelectionStep from "./SeatSelectionStep";

/**
 * 예매 좌석 배치도 Props
 */
interface BookingSeatingChartProps {
  /** 공연 정보 */
  performance: PerformanceResponse;
  /** 회차 ID */
  scheduleId: number;
}

/**
 * 예매 좌석 배치도 Orchestrator
 * - Step에 따라 SeatSelectionStep 또는 DiscountSelectionStep 표시
 * - 좌석 선택 상태를 중앙에서 관리하여 Step 간 공유
 * @param props - 컴포넌트 Props
 * @returns 예매 좌석 배치도 UI
 */
const BookingSeatingChart = ({
  performance,
  scheduleId,
}: BookingSeatingChartProps) => {
  const router = useRouter();
  const {
    step,
    setStep,
    bookingData,
    setSelectedDiscountInput,
    setPaymentConfirmation,
    setPaymentRequestData,
    isLoading,
    handleCompleteSelection,
    handleBackStep,
  } = useBookingStepControl(scheduleId);

  const { data: couponData } = useCouponsQuery();
  const { mutateAsync: validateCouponsMutation } = useValidateCoupons();

  const { savedSeatPositions, setSavedSeatPositions } = useBookingStepStore();

  /**
   * 좌석 차트 상태 중앙 관리
   * - SeatSelectionStep과 DiscountSelectionStep이 동일한 좌석 선택 상태 공유
   */
  const { seatChartConfig, toggleSeatSelection, clearSelection } =
    useBookingSeatSelection(
      performance.venue?.id || 0,
      step === BookingStep.SEAT_SELECTION ? "view" : "payment",
      scheduleId,
    );

  /**
   * Step 3 → Step 2 복귀 시 저장된 좌석 위치 복원
   * - savedSeatPositions가 있고 현재 선택된 좌석이 없을 때만 복원
   */
  useEffect(() => {
    if (
      step === BookingStep.DISCOUNT_SELECTION &&
      savedSeatPositions &&
      savedSeatPositions.length > 0 &&
      seatChartConfig?.selectedSeats.length === 0
    ) {
      // 저장된 좌석 위치를 하나씩 선택 상태로 복원
      savedSeatPositions.forEach((seat) => {
        toggleSeatSelection(seat.row, seat.col);
      });

      // 복원 완료 후 savedSeatPositions 초기화 (중복 복원 방지)
      setSavedSeatPositions(null);
    }
  }, [
    step,
    savedSeatPositions,
    seatChartConfig,
    toggleSeatSelection,
    setSavedSeatPositions,
  ]);

  /**
   * 할인 선택 완료 핸들러
   * - 쿠폰 적용을 검증하고 결제 페이지로 이동
   */
  const handleCompleteDiscount = async (
    selectedDiscountInput: BookingDiscountFormData,
  ): Promise<void> => {
    if (!bookingData) {
      return;
    }

    try {
      const userSelectedSeats = transformUserSelectedSeats(seatChartConfig);

      const seatInfos = bookingData.seats.map((seat) => {
        const findSeat = userSelectedSeats.find(
          (userSelectedSeat) =>
            userSelectedSeat.col + 1 === seat.col &&
            userSelectedSeat.row + 1 === seat.row,
        );

        return {
          ...findSeat,
          ...seat,
        } as SeatTotalInfo;
      });

      const seatCoupons = transformToSeatCoupons(
        selectedDiscountInput,
        seatInfos,
      );

      const validationResponse = await validateCouponsMutation({
        bookingId: bookingData.bookingId,
        seatCoupons,
      });

      if (!validationResponse.allValid) {
        toast.error(
          "할인정보가 정상적이지 않습니다. 잠시 후 재 시도하시기 바랍니다.",
        );
        return;
      }

      setSelectedDiscountInput(selectedDiscountInput);

      // 화면 표시용 데이터 생성
      const paymentData = createPaymentConfirmationData(
        performance,
        bookingData,
        validationResponse,
        scheduleId,
        seatInfos,
        couponData || [],
      );
      setPaymentConfirmation(paymentData);

      // 서버 전송용 데이터 생성 (paymentMethod, isAgreed 제외)
      const paymentRequestData = createPaymentRequestData(
        bookingData,
        validationResponse,
        performance,
        seatInfos,
        couponData || [],
      );

      setPaymentRequestData(paymentRequestData);

      const seatPositions = userSelectedSeats.map((seat) => ({
        row: seat.row,
        col: seat.col,
        section: seat.section,
      }));
      setSavedSeatPositions(seatPositions);

      setStep(BookingStep.PAYMENT);
      router.push(PAGES.BOOKING.PAYMENT.path);
    } catch (error) {
      console.error("쿠폰 검증 실패:", error);
      toast.error("가격 검증에 실패했습니다.");
    }
  };

  return (
    <>
      {step === BookingStep.SEAT_SELECTION && (
        <SeatSelectionStep
          seatChartConfig={seatChartConfig}
          toggleSeatSelection={toggleSeatSelection}
          clearSelection={clearSelection}
          onComplete={handleCompleteSelection}
          isLoading={isLoading}
        />
      )}
      {step === BookingStep.DISCOUNT_SELECTION && bookingData && (
        <DiscountSelectionStep
          seatChartConfig={seatChartConfig}
          toggleSeatSelection={toggleSeatSelection}
          onBack={handleBackStep}
          onComplete={handleCompleteDiscount}
        />
      )}
    </>
  );
};

export default BookingSeatingChart;
