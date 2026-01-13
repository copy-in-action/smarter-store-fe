/**
 * 예매 프로세스 헤더 컴포넌트
 * - 공연 제목, 일정변경 버튼, 결제 타이머 표시
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getPerformanceDetail } from "@/entities/performance/api/performance.api";
import {
  BookingStep,
  useBookingStepStore,
} from "@/features/service/booking-process";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import BookingTimer from "./BookingTimer";

/**
 * 예매 프로세스 공통 헤더
 * - Layout에서 사용하여 페이지 전환 시에도 타이머 유지
 * - 내부에서 performance 데이터 조회 및 타이머 관리
 * @returns 헤더 UI
 */
const BookingHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { step, bookingData, reset, paymentConfirmation } =
    useBookingStepStore(); // Get paymentConfirmation from store

  // Zustand hydration 완료 상태 체크
  const [isHydrated, setIsHydrated] = useState(false);

  const paymentData = paymentConfirmation; // Use paymentConfirmation directly
  const performanceId =
    searchParams.get("performanceId") || paymentData?.performance.id || 0;

  // 공연 정보 조회 (React Query 캐싱)
  const { data: performance } = useQuery({
    queryKey: ["performance", performanceId],
    queryFn: () => getPerformanceDetail(Number(performanceId)),
    enabled: !!performanceId,
  });

  /**
   * Zustand persist hydration 완료 체크
   * - sessionStorage 복원이 완료될 때까지 대기
   */
  useEffect(() => {
    const unsubscribe = useBookingStepStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    // 이미 hydration이 완료된 경우
    if (useBookingStepStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return unsubscribe;
  }, []);

  /**
   * 결제 페이지에서 결제 데이터가 없으면 홈으로 리다이렉트
   * - hydration 완료 후에만 체크하여 false positive 방지
   */
  useEffect(() => {
    if (!isHydrated) return; // hydration 대기

    if (pathname === PAGES.BOOKING.PAYMENT.path && !paymentData) {
      router.replace(PAGES.HOME.path);
    }
  }, [isHydrated, pathname, paymentData, router]);

  /**
   * 브라우저 뒤로가기 감지 (Step 3 → Step 2)
   * - BookingHeader는 항상 마운트되어 있으므로 여기서 처리
   * - Step 3에서 뒤로가기 시 prevStep() 호출하여 step을 2로, paymentConfirmation 제거
   */
  useEffect(() => {
    if (!isHydrated) return; // hydration 대기

    const handlePopState = () => {
      // popstate 시점의 최신 step 상태 가져오기
      const currentStep = useBookingStepStore.getState().step;
      const { prevStep, reset } = useBookingStepStore.getState();

      /**
       * Step 3(결제 페이지)에서 popstate 발생 시 무조건 prevStep() 호출
       * - pathname 체크 안 함 (popstate 시점에는 아직 pathname이 업데이트 안 됨)
       * - Step 3에서는 뒤로가기 = Step 2로 돌아가는 것만 가능
       */
      if (currentStep === BookingStep.PAYMENT) {
        console.log("✅ Step 3 → Step 2 뒤로가기 처리");
        prevStep(); // step을 2로, paymentConfirmation을 null로 초기화
      }

      if (currentStep === BookingStep.DISCOUNT_SELECTION) {
        console.log("✅ Step 2 뒤로가기 처리");
        reset();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isHydrated]);

  /**
   * 타이머 만료 핸들러
   * - 예매 시간 만료 알림 및 store 초기화
   * - 페이지 이동 전에 상태를 먼저 정리하여 언마운트 시 hooks 오류 방지
   */
  const handleTimerExpire = useCallback(() => {
    alert(
      "결제가능 시간이 만료되었습니다. 선택하신 공연의 상세페이지로 이동합니다.",
    );

    router.push(PAGES.PERFORMANCE.DETAIL.path(performanceId!.toString()));
    reset();
  }, [performanceId, reset, router]);

  /**
   * 일정변경 버튼 클릭 핸들러
   */
  const handleScheduleChange = () => {
    console.log("일정 변경 버튼 클릭");
    // TODO: 일정 변경 로직 구현
  };

  if (!performance) {
    return <div className="h-14"></div>;
  }

  return (
    <div className="flex items-center justify-between my-4 wrapper">
      <h1 className="text-lg font-bold">{performance.title}</h1>

      <div className="flex items-center gap-4">
        {bookingData?.expiresAt && (
          <BookingTimer
            expiresAt={bookingData.expiresAt}
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
