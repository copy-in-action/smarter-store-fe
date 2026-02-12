import type {
  PaymentResponsePaymentMethod,
  PaymentResponsePaymentStatus,
} from "@/shared/api/orval/types";

/**
 * 결제 수단 한글 레이블 매핑
 */
export const PAYMENT_METHOD_LABELS: Record<
  PaymentResponsePaymentMethod,
  string
> = {
  CREDIT_CARD: "신용카드",
  DEBIT_CARD: "체크카드",
  BANK_TRANSFER: "계좌이체",
  VIRTUAL_ACCOUNT: "무통장입금",
  KAKAO_PAY: "카카오페이",
  NAVER_PAY: "네이버페이",
  TOSS_PAY: "토스페이",
  PAYCO: "페이코",
  POINT: "포인트",
};

/**
 * 결제 상태 한글 레이블 매핑
 */
export const PAYMENT_STATUS_LABELS: Record<
  PaymentResponsePaymentStatus,
  string
> = {
  PENDING: "결제 대기",
  COMPLETED: "결제 완료",
  FAILED: "결제 실패",
  CANCELLED: "결제 취소",
  REFUNDED: "환불 완료",
  PARTIAL_REFUNDED: "부분 환불",
};

/**
 * 결제 수단 한글 레이블 반환
 * @param method - 결제 수단 코드
 * @returns 한글 레이블
 */
export function getPaymentMethodLabel(
  method: PaymentResponsePaymentMethod,
): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

/**
 * 결제 상태 한글 레이블 반환
 * @param status - 결제 상태 코드
 * @returns 한글 레이블
 */
export function getPaymentStatusLabel(
  status: PaymentResponsePaymentStatus,
): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
