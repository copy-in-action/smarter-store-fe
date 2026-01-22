"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { getReleaseBookingUrl } from "@/shared/api/orval/booking/booking";
import { BookingStep, useBookingStepStore } from "../../model/booking-step.store";

/**
 * 예매 프로세스 이탈 시 좌석 점유 해제를 처리하는 클라이언트 컴포넌트
 * - beforeunload: 사용자에게 이탈 여부 확인창 표시
 * - unload: 사용자가 이탈을 확정하면 sendBeacon API 호출 및 할인선택 화면 시 step1로 이동
 */
export const BookingUnloadManager = ({ children }: { children: ReactNode }) => {
  const { bookingData, step, reset, prevStep } = useBookingStepStore();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 스토어에 bookingId가 있을 경우에만 확인창을 띄웁니다.
      if (bookingData?.bookingId) {
        // MDN 및 최신 브라우저 정책에 따라, 커스텀 메시지는 더 이상 표시되지 않습니다.
        // 대신 브라우저 기본 확인 메시지가 출력됩니다.
        // preventDefault() 호출만으로도 이탈 방지 확인창이 활성화됩니다.
        event.preventDefault();
        // 일부 레거시 브라우저 호환성을 위해 returnValue를 설정합니다.
        event.returnValue = "";
      }
    };

    // storage에 저정한 예매관련 데이터를 모두 초기화
    const handleUnload = () => {
      // 스토어에서 bookingId 추출
      reset();
      prevStep();
      const bookingId = bookingData?.bookingId;

      if (bookingId) {
        const fullReleaseUrl = getReleaseBookingUrl();
        const pathOnlyReleaseUrl = new URL(fullReleaseUrl).pathname;

        const url =
          process.env.NODE_ENV === "production"
            ? fullReleaseUrl
            : pathOnlyReleaseUrl;
        const data = new Blob([JSON.stringify({ bookingId })], {
          type: "application/json",
        });

        // 페이지가 닫히는 중에도 안정적으로 요청을 보냄
        navigator.sendBeacon(url, data);
      }
    };

    // Step 2 (할인 선택) 단계에서만 이탈 방지 로직을 적용
    if (step === BookingStep.DISCOUNT_SELECTION) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("unload", handleUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("unload", handleUnload);
      };
    }
  }, [bookingData, step, reset, prevStep]);

  return <>{children}</>;
};
