"use client";

import Link from "next/link";

import { BookingDetailView as BookingDetailFeature } from "@/features/service/booking-detail";
import { PAGES } from "@/shared/config";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

/**
 * 마이페이지 예매 상세 뷰 속성
 */
interface MyBookingDetailViewProps {
  /** 예매 ID */
  bookingId: string;
}

/**
 * 마이페이지 예매 상세 뷰
 */
export default function MyBookingDetailView({
  bookingId,
}: MyBookingDetailViewProps) {
  return (
    <div className="py-4 wrapper">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList className="text-xl font-bold tracking-tight sm:text-2xl">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-black">
                <Link href={PAGES.MY.path}>마이 페이지</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-black">
                <Link href={PAGES.MY.BOOKINGS.LIST.path}>예매 내역</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold tracking-tight">
                예매 상세
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="mt-2 text-sm text-muted-foreground">
          예매 상세 정보를 확인하고 관리하세요.
        </p>
      </div>
      <BookingDetailFeature bookingId={bookingId} />
    </div>
  );
}
