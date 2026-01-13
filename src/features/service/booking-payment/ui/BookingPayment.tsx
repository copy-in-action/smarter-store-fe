import { ChevronLeft } from "lucide-react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/app/providers";
import {
  BookingPaymentInfo,
  PaymentMethodSelector,
  ReservationInfo,
  TermsAgreement,
  TicketOrderDetail,
  useGetPerformanceSchedule,
} from "@/features/service/booking-payment";
import { useBookingStepStore } from "@/features/service/booking-process";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";

/**
 * 예매 결제 페이지 컴포넌트
 * sessionStorage에서 결제 정보를 읽어와 결제 프로세스를 진행합니다
 * @returns 예매 결제 페이지 UI
 */
const BookingPayment = () => {
  const { prevStep, paymentConfirmation, reset } = useBookingStepStore(); // Get paymentConfirmation from store
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: schedule } = useGetPerformanceSchedule(
    paymentConfirmation?.scheduleId ?? 0,
  );

  // popstate 이벤트 발생 여부를 추적하는 ref
  const isPopStateRef = useRef(false);

  const handleBackStep = () => {
    prevStep();
    router.back();
  };

  /**
   * popstate 이벤트 감지 (브라우저 뒤로가기/앞으로가기)
   * - 플래그를 설정하여 일반 페이지 이동과 구분
   */
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      // 다음 렌더 사이클 후 플래그 리셋
      setTimeout(() => {
        isPopStateRef.current = false;
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /**
   * Step 3(결제 페이지)에서 다른 페이지로 이동 시 스토어 초기화
   * - 브라우저 뒤로가기 (popstate)인 경우는 제외 (prevStep으로 처리)
   * - 홈 버튼이나 다른 페이지로 이동하는 경우 전체 스토어 초기화
   */
  useEffect(() => {
    /**
     * pathname이 결제 페이지가 아니고, popstate 이벤트가 아닌 경우
     * → 홈이나 다른 페이지로 일반 이동한 것이므로 스토어 초기화
     */
    if (pathname !== PAGES.BOOKING.PAYMENT.path && !isPopStateRef.current) {
      reset();
    }
  }, [pathname, reset]);

  const paymentInfo = paymentConfirmation;
  if (!user) {
    notFound();
  }

  if (!paymentInfo) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between lg:pb-10">
      <div className="flex flex-col lg:gap-6 gap-0 lg:flex-row px-0! wrapper w-full pb-24 lg:pb-0">
        <div className="grow">
          <h2 className="items-center hidden mb-6 text-xl font-bold lg:flex">
            <Button variant={"ghost"} size={"icon"} onClick={handleBackStep}>
              <ChevronLeft className="size-6" />
            </Button>
            티켓 결제
          </h2>
          {/* 티켓 주문상세 */}
          <TicketOrderDetail
            performance={paymentInfo.performance}
            tickets={paymentInfo.ticketDetails}
            showDateTime={schedule?.showDateTime || ""}
          />
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 예약자 정보 */}
          <ReservationInfo user={user} />
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 결제수단 */}
          <PaymentMethodSelector />
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 결제정보 모바일에서만 표시*/}
          <section className="block wrapper lg:hidden px-4!">
            <BookingPaymentInfo payment={paymentInfo.payment} />
          </section>
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl block lg:hidden" />

          {/* 약관동의 */}
          <TermsAgreement />
        </div>

        {/* 결제정보: sm이상에서만 표시 */}
        <section className="hidden px-4 border rounded-2xl sm:border-none lg:w-80 lg:min-w-80 lg:block lg:sticky lg:top-[135px] h-fit">
          <BookingPaymentInfo payment={paymentInfo.payment} />
        </section>
      </div>
      <div
        className="fixed bottom-14 left-0 z-50 w-full bg-white wrapper flex sm:bottom-0 lg:hidden
                  /* 중요: 하단바가 덜덜 떨리는 것을 방지하는 속성 */
                  will-change-transform transform-none"
      >
        <Button size={"lg"} className="w-full my-2">
          총 {paymentInfo.payment.totalAmount.toLocaleString()}원 결제하기
        </Button>
      </div>
    </div>
  );
};

export default BookingPayment;
