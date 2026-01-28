"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { BookingStep, useBookingStepStore } from "@/features/booking";
import { getReleaseBookingUrl } from "@/shared/api/orval/booking/booking";

/**
 * 예매 프로세스 이탈 감지 및 자동 해제 컴포넌트
 *
 * 역할:
 * 1. 라우트 변경 감지 (/booking 이탈 시)
 * 2. 브라우저/탭 닫기 감지 (beforeunload, unload)
 * 3. 예매 좌석 점유 해제 (releaseBooking)
 *
 * 특징:
 * - 최상위 레이아웃(RootLayout)에 위치하여 모든 경로 변경을 감시
 * - fetch(keepalive: true)를 사용하여 페이지가 닫혀도 요청 보장
 */
export function BookingResetWatcher() {
  const pathname = usePathname();
  const { step, reset, bookingData } = useBookingStepStore();

  // popstate(뒤로가기) 감지용 ref
  const isPopStateRef = useRef(false);
  // 이전 경로 추적용 ref
  const prevPathnameRef = useRef(pathname);

  /**
   * 좌석 점유 해제 요청 (공통 함수)
   * - 브라우저 종료 시 전송 보장률이 가장 높은 navigator.sendBeacon 사용
   * - 쿠키 인증 방식이므로 별도 헤더 설정 없이도 안전하게 전송됨
   */
  const releaseSeat = useCallback(() => {
    if (!bookingData?.bookingId) return;

    const fullReleaseUrl = getReleaseBookingUrl();
    const pathOnlyReleaseUrl = new URL(fullReleaseUrl).pathname;

    // 개발 환경: 프록시 사용을 위해 상대 경로 사용
    // 프로덕션: 절대 경로 사용
    const url =
      process.env.NODE_ENV === "production"
        ? fullReleaseUrl
        : pathOnlyReleaseUrl;

    const data = new Blob(
      [JSON.stringify({ bookingId: bookingData.bookingId })],
      { type: "application/json" },
    );

    // sendBeacon으로 전송 (페이지가 닫혀도 브라우저가 전송 보장)
    navigator.sendBeacon(url, data);
  }, [bookingData?.bookingId]);

  /**
   * 1. popstate 이벤트 감지 (브라우저 뒤로가기/앞으로가기)
   */
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      setTimeout(() => {
        isPopStateRef.current = false;
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /**
   * 2. 브라우저 탭 닫기/새로고침 감지
   * - 할인 선택(Step 2) 단계에서만 동작
   * - 서버에 점유해제 요청
   * - 스토어 초기화
   */
  useEffect(() => {
    const isBookingInProgress =
      step === BookingStep.DISCOUNT_SELECTION && !!bookingData?.bookingId;

    if (!isBookingInProgress) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Chrome 호환성
    };
    const handleUnload = () => {
      releaseSeat();
      reset();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [step, bookingData, releaseSeat, reset]);

  /**
   * 3. 라우트 변경 감지 (/booking -> 다른 경로)
   */
  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    const currentPath = pathname;

    // /booking 경로에서 다른 경로로 이동 시 (뒤로가기 제외)
    if (
      prevPath.startsWith("/booking") &&
      !currentPath.startsWith("/booking") &&
      !isPopStateRef.current
    ) {
      if (bookingData?.bookingId) {
        // 스토어 초기화 및 좌석 해제
        reset();
        releaseSeat();
      }
    }

    prevPathnameRef.current = pathname;
  }, [pathname, bookingData, reset, releaseSeat]);

  return null;
}
