import { useMemo } from "react";
import type { BookingDetailResponse } from "@/entities/booking";
import { formatCurrency } from "@/shared/lib/format";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/shared/lib/payment";

/**
 * 예매 결제 정보 속성
 */
interface BookingPaymentInfoProps {
  /** 예매 상세 정보 */
  booking: BookingDetailResponse;
}

/**
 * 예매 상세 결제 정보를 표시하는 컴포넌트
 */
export function BookingPaymentInfo({ booking }: BookingPaymentInfoProps) {
  return (
    <>
      {/* 좌석 정보 */}
      {!booking.paymentDetail && (
        <div>
          <h2 className="mb-2 text-lg font-bold sm:text-xl">좌석</h2>

          <div className="space-y-2">
            {booking.seats.map((seat) => (
              <div
                key={seat.id}
                className="flex justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {seat.section} {seat.row}열 {seat.col}번
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결제 정보 */}
      {booking.paymentDetail && (
        <div>
          <h2 className="mb-2 text-lg font-bold sm:text-xl">결제</h2>

          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 방법</span>
              <span className="font-medium">
                {getPaymentMethodLabel(
                  booking.paymentDetail.payment.paymentMethod,
                )}
              </span>
            </div>
            {booking.paymentDetail.pgInfo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제 정보</span>
                <span className="font-medium">
                  {booking.paymentDetail.pgInfo.cardCompany}{" "}
                  {booking.paymentDetail.pgInfo.cardNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 상태</span>
              <span className="font-medium">
                {getPaymentStatusLabel(
                  booking.paymentDetail.payment.paymentStatus,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-bold text-primary">
                {formatCurrency(booking.paymentDetail.payment.finalPrice)}
              </span>
            </div>

            {/* 결제항목 */}
            {booking.paymentDetail.items.length > 0 && (
              <div className="pt-3 border-t">
                <p className="mb-2 text-black text-semibold">결제 항목</p>
                {booking.paymentDetail.items.map((item, index) => {
                  const discount = booking.paymentDetail?.discounts[index];
                  const discountAmount = discount?.amount || 0;

                  return (
                    <div
                      key={item.row + item.col}
                      className="flex justify-between py-1 text-sm"
                    >
                      <span>
                        {item.seatGrade}석 {item.col}열 {item.row}번 [
                        {discount?.name}
                        {discountAmount > 0 &&
                          ` (-${formatCurrency(discountAmount)})`}
                        ]
                      </span>
                      <span className="min-w-20 text-end">
                        {formatCurrency(item.finalPrice)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-1 text-sm">
                  <span>예매 수수료</span>
                  <span>
                    {formatCurrency(booking.paymentDetail.payment.bookingFee)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
