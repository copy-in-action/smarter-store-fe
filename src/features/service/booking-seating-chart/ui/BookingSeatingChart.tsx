/**
 * 예매 좌석 배치도 컴포넌트
 */
"use client";

import { useRouter } from "next/navigation";
import { useCouponsQuery } from "@/entities/coupon";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import { SeatChart } from "@/shared/lib/seat";
import { PAYMENT_INFO_STORAGE_KEY } from "@/shared/lib/seat/constants/seatChart.constants";
import { BookingStep } from "../../booking-process";
import { useBookingStepControl } from "../hooks/useBookingStepControl";
import { useBookingUIState } from "../hooks/useBookingUIState";
import { createPaymentConfirmationData } from "../lib/createPaymentConfirmationData";
import BookingDiscountSelectionForm, {
  type BookingDiscountSubmitData,
} from "./BookingDiscountSelectionForm";
import LoadingSpinner from "./LoadingSpinner";
import SeatGradePricePopover from "./SeatGradePricePopover";
import SelectSeatInfo from "./SelectSeatInfo";

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
 * 예매 좌석 배치도 및 할인 선택 컴포넌트
 * - Step 1: 좌석 선택 및 좌석 정보 표시
 * - Step 2: 할인 방법 선택 및 결제 진행
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
    isLoading,
    handleCompleteSelection,
    handleBackStep,
  } = useBookingStepControl(scheduleId);

  const {
    seatChartConfig,
    seatGradeInfo,
    userSelectedSeats,
    selectedGradeInfoList,
    toggleSeatSelection,
    clearSelection,
  } = useBookingUIState(performance, scheduleId);

  const { data: couponData, isLoading: isCouponsLoading } = useCouponsQuery();

  /**
   * 좌석 선택 완료 핸들러
   * - userSelectedSeats를 좌석 점유 API 형식으로 변환하여 전달
   */
  const handleSelectComplete = () => {
    if (userSelectedSeats.length === 0) return;

    const seats = userSelectedSeats.map((seat) => ({
      row: seat.row + 1,
      col: seat.col + 1,
    }));

    handleCompleteSelection(seats);
  };

  if (seatChartConfig == null || isCouponsLoading) {
    return <LoadingSpinner />;
  }

  /**
   * 할인 선택 완료 핸들러
   * - 결제 확인 데이터 생성 및 sessionStorage 저장
   * @param data - 할인 선택 데이터
   */
  const handleCompleteDiscount = (data: BookingDiscountSubmitData) => {
    if (!bookingData) return;

    const paymentData = createPaymentConfirmationData(
      performance,
      bookingData,
      data,
      userSelectedSeats,
      scheduleId,
    );

    sessionStorage.setItem(
      PAYMENT_INFO_STORAGE_KEY,
      JSON.stringify(paymentData),
    );
    setStep(BookingStep.PAYMENT);

    router.push(PAGES.BOOKING.PAYMENT.path);
  };

  return (
    <div className="flex flex-col gap-6 wrapper lg:flex-row">
      <section className="relative overflow-auto grow">
        <SeatChart
          config={{
            ...seatChartConfig,
            /**
             * Step에 따른 SeatChart 모드 전환
             * - Step 1 (좌석 선택): view 모드 - 좌석 선택 가능
             * - Step 2 (할인 선택): payment 모드 - 좌석 선택 불가, 확정된 좌석만 표시
             */
            mode: step === BookingStep.SEAT_SELECTION ? "view" : "payment",
          }}
          onSeatClick={toggleSeatSelection}
        />
        <div className="absolute top-3 end-3">
          <SeatGradePricePopover seatGradeInfo={seatGradeInfo} />
        </div>
      </section>
      <section className="lg:w-80 lg:min-w-80">
        {step === BookingStep.SEAT_SELECTION && (
          <SelectSeatInfo
            userSelectedSeats={userSelectedSeats}
            onClearSelection={clearSelection}
            onToggleSeatSelection={toggleSeatSelection}
            onComplete={handleSelectComplete}
            isLoading={isLoading}
          />
        )}
        {step === BookingStep.DISCOUNT_SELECTION && (
          <BookingDiscountSelectionForm
            grades={selectedGradeInfoList}
            discountMethods={couponData || []}
            onBackStep={handleBackStep}
            onSubmit={handleCompleteDiscount}
          />
        )}
      </section>
    </div>
  );
};

export default BookingSeatingChart;
