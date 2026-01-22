import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  useConfirmBooking,
  useCreatePayment,
  useGetPerformanceSchedule,
} from "@/features/booking/payment";
import {
  type PaymentFormData,
  paymentFormSchema,
} from "@/features/booking/payment/model/payment-form.schema";
import { useBookingStepStore } from "@/features/booking";
import { PAGES } from "@/shared/config";
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

  // 결제 진행 중 상태 (오버레이 표시용)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  // 팝업 창 참조
  const popupRef = useRef<Window | null>(null);

  // 결제 폼 초기화
  const methods = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      isAgreed: false,
      paymentMethod: (() => {
        const methods = ["VIRTUAL_ACCOUNT", "CREDIT_CARD", "KAKAO_PAY", "TOSS_PAY"] as const;
        return methods[Math.floor(Math.random() * methods.length)];
      })(),
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
  // 예매 확정 mutation
  const { mutate: confirmBookingMutation } = useConfirmBooking();

  const handleBackStep = () => {
    if (isPaymentProcessing) return;
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

    // 은행/결제수단 명칭 결정
    const bankName = formData.bankCode || "";

    const amount = paymentConfirmation?.payment.totalAmount || 0;

    // 1. 팝업 선오픈 (팝업 차단 방지)
    const width = 450;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // 이전에 열린 팝업이 있다면 닫기
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    // 빈 창 우선 열기 (about:blank)
    popupRef.current = window.open(
      "about:blank",
      "payment_popup",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popupRef.current) {
      toast.error("팝업 차단을 해제해주세요.");
      return;
    }

    setIsPaymentProcessing(true); // 오버레이 활성화

    // 결제 요청 데이터 생성 (폼 데이터 + 스토어 데이터 병합)
    const finalPaymentRequest = {
      ...paymentRequestData,
      paymentMethod: formData.paymentMethod,
      isAgreed: formData.isAgreed,
      reserverInfo: formData.reserverInfo,
    };

    // 2. 결제 생성 API 호출
    createPaymentMutation(finalPaymentRequest, {
      onSuccess: (data) => {
        // API 성공 시 실제 결제 팝업 페이지로 이동
        if (popupRef.current && !popupRef.current.closed) {
          const popupUrl = `/booking/payment/gateway?paymentId=${data.id}&bankName=${encodeURIComponent(bankName)}&amount=${amount}`;
          popupRef.current.location.href = popupUrl;
        } else {
          toast.error("결제 팝업이 닫혔습니다. 다시 시도해주세요.");
          setIsPaymentProcessing(false);
        }

        console.log("Payment created:", data);
      },
      onError: (error) => {
        toast.error("결제 요청 생성에 실패했습니다.");
        console.error("Payment creation failed:", error);

        // 에러 시 팝업 닫기 및 오버레이 해제
        if (popupRef.current) popupRef.current.close();
        setIsPaymentProcessing(false);
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
   * 팝업 통신 리스너
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAYMENT_RESULT") {
        const { status } = event.data;

        if (status === "SUCCESS") {
          // 결제 성공 시 예매 확정 API 호출
          const paymentData = event.data?.data;
          if (paymentData?.bookingId) {
            confirmBookingMutation(paymentData.bookingId, {
              onSuccess: () => {
                // 스토어 초기화
                reset();
                alert(
                  "예매가 완료되었습니다. 확인 버튼을 누르면 메인페이지로 이동되며 예매 이력은 마이 페이지에서 확인 할 수 있습니다.",
                );
                router.replace(PAGES.HOME.path);
              },
              onError: (error) => {
                toast.error("예매 확정에 실패했습니다.");
                console.error("Booking confirmation failed:", error);
              },
            });
          } else {
            toast.error("예매 정보를 찾을 수 없습니다.");
          }
        } else if (status === "CANCEL") {
          toast.warning("결제가 취소되었습니다.");
        } else {
          toast.error("결제 중 오류가 발생했습니다.");
        }

        // 팝업 종료 후 처리
        setIsPaymentProcessing(false);
        popupRef.current = null;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reset, router.replace, confirmBookingMutation]);

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
    <>
      {/* 결제 진행 중 오버레이 */}
      {isPaymentProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <Loader2 className="size-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              결제 진행 중
            </h3>
            <p className="text-gray-500 text-center">
              결제 팝업창에서 결제를 완료해주세요.
              <br />
              팝업창이 보이지 않으면 팝업 차단을 확인해주세요.
            </p>
          </div>
        </div>
      )}

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
                  disabled={isPaymentProcessing}
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
              <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto" />

              {/* 예약자 정보 */}
              <ReservationInfo />
              <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto" />

              {/* 결제수단 */}
              <PaymentMethodSelector />
              <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto" />

              {/* 결제정보 모바일에서만 표시*/}
              <section className="block wrapper lg:hidden px-4!">
                <BookingPaymentInfo payment={paymentInfo.payment} />
              </section>
              <hr className="h-2 my-5 bg-gray-100 sm:h-[1px] mx-auto block lg:hidden" />

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
              disabled={isPending || isPaymentProcessing}
            >
              {isPending || isPaymentProcessing
                ? "결제 진행 중..."
                : `총 ${paymentInfo.payment.totalAmount.toLocaleString()}원 결제하기`}
            </Button>
          </div>
          {/* 데스크탑 결제 버튼 (원래 코드에 없었으나 구조상 빠진듯 하여 추가하거나, 원래는 BookingPaymentInfo에 있었을 수 있음. 여기서는 모바일 하단바만 수정) */}
        </form>
      </FormProvider>
    </>
  );
};

export default BookingPayment;
