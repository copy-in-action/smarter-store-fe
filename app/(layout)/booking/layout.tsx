"use client";

import type { ReactNode } from "react";
import { BookingHeader } from "@/widgets/booking-header";

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
 * - 이탈 방지 및 초기화 로직은 전역 Provider(BookingResetWatcher)로 위임됨
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
