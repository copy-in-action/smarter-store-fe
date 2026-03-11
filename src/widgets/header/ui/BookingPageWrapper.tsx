"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

/**
 * Booking 페이지 래퍼 Props
 */
interface BookingPageWrapperProps {
  /** 래핑할 콘텐츠 */
  children: React.ReactNode;
  className?: string;
}

/**
 * Booking 페이지에서 모바일 화면에서 콘텐츠를 숨기는 래퍼 컴포넌트
 * pathname이 /booking으로 시작하면 모바일에서 숨김 처리
 * @param props - 컴포넌트 Props
 * @param props.children - 래핑할 콘텐츠
 * @returns 조건부 렌더링되는 래퍼
 */
export function BookingPageWrapper({
  children,
  className,
}: BookingPageWrapperProps) {
  const pathname = usePathname();
  const isBookingPage = pathname.startsWith("/booking");

  return (
    <div className={cn({ "sm:block hidden": isBookingPage }, className)}>
      {children}
    </div>
  );
}
