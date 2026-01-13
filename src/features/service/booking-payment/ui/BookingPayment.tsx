import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  type FieldError,
  type FieldErrors,
  FormProvider,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";
import {
  BookingPaymentInfo,
  PaymentMethodSelector,
  ReservationInfo,
  TermsAgreement,
  TicketOrderDetail,
  useCreatePayment,
  useGetPerformanceSchedule,
} from "@/features/service/booking-payment";
import {
  type PaymentFormData,
  paymentFormSchema,
} from "@/features/service/booking-payment/model/payment-form.schema";
import { useBookingStepStore } from "@/features/service/booking-process";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";

/**
 * 예매 결제 페이지 컴포넌트
 * sessionStorage에서 결제 정보를 읽어와 결제 프로세스를 진행합니다
 * @returns 예매 결제 페이지 UI
 */
const BookingPayment = () => {
  const { prevStep, paymentConfirmation, paymentRequestData, reset } =
    useBookingStepStore();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: schedule } = useGetPerformanceSchedule(
    paymentConfirmation?.scheduleId ?? 0,
  );

  // popstate 이벤트 발생 여부를 추적하는 ref
  const isPopStateRef = useRef(false);

  // 결제 폼 초기화
  const methods = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      isAgreed: false,
      paymentMethod: "CREDIT_CARD",
      bankCode: undefined,
      reserverInfo: {
        name: user?.username,
        email: user?.email,
        phone: user?.phoneNumber,
      },
    },
  });

  // 결제 생성 mutation
  const { mutate: createPaymentMutation, isPending } = useCreatePayment();

  const handleBackStep = () => {
    prevStep();
    router.back();
  };

  /**
   * 결제 폼 제출 처리
   * - handleSubmit을 통과했으므로 폼 스키마 검증은 이미 완료됨
   * @param formData - 검증된 폼 데이터
   */
  const onSubmit = (formData: PaymentFormData) => {
    // 스토어 데이터 검증 (폼 스키마와 무관)
    if (!paymentRequestData) {
      toast.error("결제 정보가 없습니다. 다시 시도해주세요.");
      return;
    }

    // 결제 요청 데이터 생성 (폼 데이터 + 스토어 데이터 병합)
    const finalPaymentRequest = {
      ...paymentRequestData,
      paymentMethod: formData.paymentMethod,
      isAgreed: formData.isAgreed,
      reserverInfo: formData.reserverInfo,
    };

    // 결제 생성 API 호출
    createPaymentMutation(finalPaymentRequest, {
      onSuccess: (data) => {
        toast.success("결제 요청이 생성되었습니다.");
        // TODO: PG 결제 팝업 열기
        console.log("Payment created:", data);
      },
      onError: (error) => {
        toast.error("결제 요청 생성에 실패했습니다.");
        console.error("Payment creation failed:", error);
      },
    });
  };

  const onSubmitError = (errors: FieldErrors<PaymentFormData>) => {
    const reserverInfoError = errors.reserverInfo;
    // 중첩 객체이므로
    if (reserverInfoError) {
      const firstError = Object.values(reserverInfoError)[0] as FieldError;
      toast.error(firstError?.message, { id: "payment-error-toast" });
      return;
    }

    const firstError = Object.values(errors)[0];
    if (firstError.message) {
      toast.error(firstError.message, { id: "payment-error-toast" });
      return;
    }
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
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onSubmitError)}
        className="flex flex-col justify-between lg:pb-10"
      >
        <div className="flex flex-col lg:gap-6 gap-0 lg:flex-row px-0! wrapper w-full pb-24 lg:pb-0">
          <div className="grow">
            <h2 className="items-center hidden mb-6 text-xl font-bold lg:flex">
              <Button
                type="button"
                variant={"ghost"}
                size={"icon"}
                onClick={handleBackStep}
              >
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
            <ReservationInfo />
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
          <Button
            type="submit"
            size={"lg"}
            className="w-full my-2"
            disabled={isPending}
          >
            {isPending
              ? "결제 요청 중..."
              : `총 ${paymentInfo.payment.totalAmount.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default BookingPayment;
