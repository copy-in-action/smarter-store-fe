"use client";

import Link from "next/link";

import { BookingListContainer } from "@/features/service/booking-list";
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
 * 마이페이지 예매 내역 리스트 뷰
 */
export default function MyBookingsListView() {
  return (
    <div className="wrapper py-4">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList className="text-xl sm:text-2xl font-bold tracking-tight">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-black">
                <Link href={PAGES.MY.path}>마이 페이지</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold tracking-tight">
                예매 내역
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-muted-foreground text-sm mt-2">
          예매번호를 클릭하여 상세 정보를 확인할 수 있습니다.
        </p>
      </div>
      <BookingListContainer />
    </div>
  );
}
