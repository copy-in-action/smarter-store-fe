import { CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useCancelPayment } from "../api/useCancelPayment";
import { useCompletePayment } from "../api/useCompletePayment";

/**
 * PG 결제 시뮬레이션 팝업 컴포넌트
 */
export const PgPaymentPopup = () => {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // 결제 승인 Mutation
  const { mutate: completePayment, isPending: isCompletePending } =
    useCompletePayment();
  // 결제 취소 Mutation
  const { mutate: cancelPayment, isPending: isCancelPending } =
    useCancelPayment();

  const isPending = isCompletePending || isCancelPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const bankName = searchParams.get("bankName") || "신용카드";
  const amount = searchParams.get("amount") || "0";
  // 결제 ID
  const paymentId = searchParams.get("paymentId");

  /**
   * 결제 승인 처리
   */
  const handleConfirm = () => {
    if (!paymentId) {
      toast.error("결제 ID가 없습니다.");
      return;
    }

    // 하드코딩된 목 데이터
    const mockPaymentData = {
      pgProvider: "TossPayments",
      pgTransactionId: `ts_${new Date().getTime()}`,
      cardCompany: "Hyundai",
      cardNumberMasked: "1234-****-****-5678",
      installmentMonths: 0,
    };

    completePayment(
      { id: paymentId, data: mockPaymentData },
      {
        onSuccess: (data) => {
          if (window.opener) {
            window.opener.postMessage(
              { type: "PAYMENT_RESULT", status: "SUCCESS", data: data.data },
              "*",
            );
            window.close();
          }
        },
        onError: (error) => {
          console.error("결제 승인 실패:", error);
          toast.error(error.message || "결제 승인 처리에 실패했습니다.");
          if (window.opener) {
            window.opener.postMessage(
              { type: "PAYT_RESULT", status: "FAIL" },
              "*",
            );
          }
        },
      },
    );
  };

  /**
   * 결제 취소 처리
   */
  const handleCancel = () => {
    if (!paymentId) {
      // ID가 없으면 그냥 닫기
      if (window.opener) {
        window.opener.postMessage(
          { type: "PAYMENT_RESULT", status: "CANCEL" },
          "*",
        );
        window.close();
      }
      return;
    }

    cancelPayment(
      { id: paymentId, data: { reason: "사용자 취소" } },
      {
        onSuccess: () => {
          if (window.opener) {
            window.opener.postMessage(
              { type: "PAYMENT_RESULT", status: "CANCEL" },
              "*",
            );
            window.close();
          }
        },
        onError: (error) => {
          console.error("결제 취소 실패:", error);
          // 취소 API 실패 시에도 일단 창은 닫거나 사용자에게 알림
          toast.error("결제 취소 처리에 실패했습니다.");
          // 실패했더라도 팝업 닫기는 진행 (UX 결정 필요)

          if (window.opener) {
            window.opener.postMessage(
              { type: "PAYMENT_RESULT", status: "CANCEL" },
              "*",
            );
            window.close();
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full border border-gray-100">
        <div className="mb-6 flex justify-center text-blue-600">
          <CreditCard size={60} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">결제 요청</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          <span className="font-bold text-blue-600 text-lg">{bankName}</span>
          <br />
          <span className="text-gray-800 font-semibold">
            {Number(amount).toLocaleString()}원
          </span>
          <br />
          결제를 진행하시겠습니까?
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={handleConfirm}
            className="w-full py-6 text-lg font-semibold"
            disabled={isPending}
          >
            {isCompletePending ? "결제 처리 중..." : "결제 승인"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full py-6 text-lg font-semibold"
            disabled={isPending}
          >
            {isCancelPending ? "취소 중..." : "취소"}
          </Button>
        </div>
      </div>
    </div>
  );
};
