import { Clock, CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [isExpired, setIsExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

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

  const bankName = searchParams.get("bankName") || "신용카드";
  const amount = searchParams.get("amount") || "0";
  // 결제 ID
  const paymentId = searchParams.get("paymentId");
  // 결제 만료 시간
  const expiresAt = searchParams.get("expiresAt");

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
    if (window.opener) {
      window.opener.postMessage(
        { type: "PAYMENT_RESULT", status: "CANCEL" },
        "*",
      );
    }
    window.close();
  };

  /**
   * 만료 시 자동 취소 처리
   */
  const handleAutoCancel = useCallback(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: "PAYMENT_RESULT", status: "EXPIRED" },
        "*",
      );
    }
    window.close();
  }, []);

  /**
   * 만료 후 닫기 버튼 핸들러
   */
  const handleExpiredClose = () => {
    handleAutoCancel();
    if (window.parent) window.close();
  };

  /**
   * 결제 만료 시간 체크 및 카운트다운
   */
  useEffect(() => {
    if (!expiresAt || isExpired) return;

    const checkExpiration = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.floor((expiry - now) / 1000); // 초 단위

      if (remaining <= 0) {
        setIsExpired(true);
        setRemainingTime(0);
        // 자동으로 취소 처리 및 부모에 알림
        handleAutoCancel();
      } else {
        setRemainingTime(remaining);
      }
    };

    checkExpiration(); // 초기 체크
    const timer = setInterval(checkExpiration, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, handleAutoCancel, isExpired]);

  // 만료 UI
  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full border border-gray-100">
          <div className="mb-6 flex justify-center text-red-600">
            <Clock size={60} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            결제 시간 만료
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm">
            결제 가능 시간이 초과되어 결제창이 종료됩니다.
            <br />
            예매를 다시 시도해주세요.
          </p>
          <Button
            onClick={handleExpiredClose}
            className="w-full py-6 text-lg font-semibold"
          >
            닫기
          </Button>
        </div>
      </div>
    );
  }

  // 정상 결제 UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full border border-gray-100">
        {/* 카운트다운 표시 */}
        {remainingTime !== null && (
          <div className="mb-4 text-sm text-gray-500 flex items-center justify-center gap-2">
            <Clock size={16} />
            <span>
              남은 시간: {Math.floor(remainingTime / 60)}분 {remainingTime % 60}
              초
            </span>
          </div>
        )}
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
