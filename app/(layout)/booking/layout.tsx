"use client";

import type { ReactNode } from "react";
import { BookingUnloadManager } from "@/features/booking";
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
 * - Client Component로 변경하여 unload 이벤트 핸들러 적용
 * @param props - 레이아웃 Props
 * @returns 레이아웃 UI
 */
const BookingLayout = ({ children }: Props) => {
  return (
    <BookingUnloadManager>
      <BookingHeader />
      <div>{children}</div>
    </BookingUnloadManager>
  );
};

export default BookingLayout;
