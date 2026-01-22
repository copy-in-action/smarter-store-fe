import { Button } from "@/shared/ui/button";
import type { PaymentConfirmationData } from "../../booking-process";

/**
 * 결제 정보 Props
 */
interface Props {
  /** 결제 정보 데이터 */
  payment: PaymentConfirmationData["payment"];
}

/**
 * 예매 결제 정보 컴포넌트
 * 티켓금액, 예매수수료, 최종 결제금액을 표시합니다
 * @param props - 컴포넌트 Props
 * @param props.payment - 결제 정보 데이터
 * @returns 결제 정보 UI
 */
const BookingPaymentInfo = ({ payment }: Props) => {
  return (
    <>
      <h2 className="mb-5 text-lg font-semibold">결제 정보</h2>
      <div className="my-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">티켓금액</span>
          <span>{payment.ticketAmount.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <span className="text-gray-400">예매수수료</span>
          <span>{payment.bookingFee.toLocaleString()}원</span>
        </div>
      </div>
      <hr className="my-4 bg-gray-100" />
      <div className="justify-between mb-6 text-lg font-semibold lg:flex text-primary lg:mb-0">
        <span>최종 결제금액</span>
        <span>{payment.totalAmount.toLocaleString()}원</span>
      </div>
      <Button size={"lg"} className="hidden w-full mt-6 mb-6 lg:block">
        총 {payment.totalAmount.toLocaleString()}원 결제하기
      </Button>
    </>
  );
};

export default BookingPaymentInfo;
