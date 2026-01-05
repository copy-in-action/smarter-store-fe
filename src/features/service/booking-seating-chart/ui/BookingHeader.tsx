/**
 * 예매 프로세스 헤더 컴포넌트
 * - 공연 제목, 일정변경 버튼, 결제 타이머 표시
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { getPerformanceDetail } from "@/entities/performance/api/performance.api";
import { PAGES } from "@/shared/constants";
import { PAYMENT_INFO_STORAGE_KEY } from "@/shared/lib/seat/constants/seatChart.constants";
import { Button } from "@/shared/ui/button";
import type { PaymentConfirmationData } from "../model/booking-seating-chart.types";
import { BookingStep, useBookingStepStore } from "../model/booking-step.store";
import BookingTimer from "./BookingTimer";

/**
 * 예매 프로세스 공통 헤더
 * - Layout에서 사용하여 페이지 전환 시에도 타이머 유지
 * - 내부에서 performance 데이터 조회 및 타이머 관리
 * @returns 헤더 UI
 */
const BookingHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { step, bookingData, reset } = useBookingStepStore();
  let paymentData: PaymentConfirmationData | null = null;
  if (step === BookingStep.PAYMENT) {
    const paymentSessionData = sessionStorage.getItem(PAYMENT_INFO_STORAGE_KEY);
    paymentData = JSON.parse(
      paymentSessionData || "",
    ) as PaymentConfirmationData;

    if (!paymentData) {
      notFound();
    }
  }

  const performanceId =
    searchParams.get("performanceId") || paymentData
      ? paymentData?.performance.id
      : 0;

  // 공연 정보 조회 (React Query 캐싱)
  const { data: performance } = useQuery({
    queryKey: ["performance", performanceId],
    queryFn: () => getPerformanceDetail(Number(performanceId)),
    enabled: !!performanceId,
  });

  /**
   * 타이머 만료 핸들러
   * - 예매 시간 만료 알림 및 store 초기화
   */
  const handleTimerExpire = () => {
    alert(
      "결제가능 시간이 만료되었습니다. 선택하신 공연의 상세페이지로 이동합니다.",
    );
    router.push(PAGES.PERFORMANCE.DETAIL.path(performanceId!.toString()));
    reset();
  };

  /**
   * 일정변경 버튼 클릭 핸들러
   */
  const handleScheduleChange = () => {
    console.log("일정 변경 버튼 클릭");
    // TODO: 일정 변경 로직 구현
  };

  if (!performance) return <div className="h-14"></div>;

  return (
    <div className="my-4 flex items-center justify-between wrapper">
      <h1 className="text-lg font-bold">{performance.title}</h1>

      <div className="flex items-center gap-4">
        {bookingData && (
          <BookingTimer
            remainingSeconds={bookingData.remainingSeconds}
            onExpire={handleTimerExpire}
          />
        )}
        {step === BookingStep.SEAT_SELECTION && (
          <Button variant={"outline"} onClick={handleScheduleChange}>
            일정변경
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingHeader;
