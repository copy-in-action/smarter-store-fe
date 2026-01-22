import { PAGES } from "@/shared/config/routes";
import { BookingPaymentView } from "@/views/service/booking-payment";

export const metadata = PAGES.BOOKING.PAYMENT.metadata;

/**
 * 예매 결제 페이지
 * @returns 예매 결제 페이지 컴포넌트
 */
export default function BookingPaymentPage() {
  return <BookingPaymentView />;
}
