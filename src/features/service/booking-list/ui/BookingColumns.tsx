"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  type BookingHistoryResponse,
  type BookingStatus,
  BookingStatusBadge,
} from "@/entities/booking";
import { PAGES } from "@/shared/config/routes";
import { formatCurrency, formatDate } from "@/shared/lib/format";

/**
 * 예매 테이블 컬럼 생성 함수
 * @returns 예매 테이블 컬럼 정의
 */
export function createBookingColumns(): ColumnDef<BookingHistoryResponse>[] {
  return [
    {
      accessorKey: "bookingNumber",
      header: "예매번호",
      cell: ({ row }) => {
        const bookingId = row.original.bookingId;
        const bookingNumber = row.getValue("bookingNumber") as string;
        return (
          <Link
            href={PAGES.MY.BOOKINGS.DETAIL.path(bookingId)}
            className="font-mono text-sm text-blue-600 hover:underline"
          >
            {bookingNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => {
        const status = row.getValue("status") as BookingStatus;
        return <BookingStatusBadge status={status} />;
      },
    },
    {
      accessorKey: "performanceTitle",
      header: "공연명",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.getValue("performanceTitle")}
        </div>
      ),
    },
    {
      accessorKey: "showDateTime",
      header: "공연 일시",
      cell: ({ row }) => {
        const dateTime = row.getValue("showDateTime") as string;
        return (
          <div className="text-sm">
            {formatDate(dateTime, "YYYY-MM-DD HH:mm")}
          </div>
        );
      },
    },

    {
      accessorKey: "totalPrice",
      header: "결제 금액",
      cell: ({ row }) => {
        const price = row.getValue("totalPrice") as number;
        return <div className="font-medium">{formatCurrency(price)}</div>;
      },
    },
    {
      accessorKey: "seatSummary",
      header: "좌석 정보",
      cell: ({ row }) => {
        const summary = row.getValue("seatSummary") as string;
        return (
          <div className="text-sm max-w-[150px] truncate" title={summary}>
            {summary}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "예매일시",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(createdAt, "YYYY-MM-DD")}
          </div>
        );
      },
    },
  ];
}
