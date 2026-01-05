import type { ReactNode } from "react";
import { BookingHeader } from "@/features/service/booking-seating-chart";

/**
 * Booking Layout Props
 */
interface Props {
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * 예매 프로세스 공통 레이아웃
 * - 페이지 전환 시에도 타이머가 유지됨
 * - Server Component로 유지하여 성능 최적화
 * @param props - 레이아웃 Props
 * @returns 레이아웃 UI
 */
const BookingLayout = ({ children }: Props) => {
  return (
    <>
      <BookingHeader />
      <div>{children}</div>
    </>
  );
};

export default BookingLayout;
