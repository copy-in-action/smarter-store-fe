import { ChevronLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
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
import { Button } from "@/shared/ui/button";

/**
 * 예매 결제 페이지 컴포넌트
 * sessionStorage에서 결제 정보를 읽어와 결제 프로세스를 진행합니다
 * @returns 예매 결제 페이지 UI
 */
const BookingPayment = () => {
  const { prevStep, paymentConfirmation } = useBookingStepStore(); // Get paymentConfirmation from store

  const paymentInfo = paymentConfirmation;
  if (!paymentInfo) {
    notFound();
  }

  const router = useRouter();
  const handleBackStep = () => {
    prevStep();
    router.back();
  };

  const { data: schedule } = useGetPerformanceSchedule(paymentInfo.scheduleId);
  const { user } = useAuth();
  if (!user) notFound();

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
          <hr className="h-2 my-5 bg-ray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 예약자 정보 */}
          <ReservationInfo user={user} />
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 결제수단 */}
          <PaymentMethodSelector />
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 결제정보 모바일에서만 표시*/}
          <section className="block wrapper sm:hidden">
            <BookingPaymentInfo payment={paymentInfo.payment} />
          </section>
          <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto max-w-4xl" />

          {/* 약관동의 */}
          <TermsAgreement />
        </div>

        {/* 결제정보: sm이상에서만 표시 */}
        <section className="hidden px-4 border rounded-2xl sm:border-none lg:w-80 lg:min-w-80 sm:block">
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
