"use client";

import { useMyBookingsQuery } from "@/entities/booking";
import { createBookingColumns } from "./BookingColumns";
import { BookingDataTable } from "./BookingDataTable";

/**
 * 예매 내역 리스트 컨테이너 컴포넌트
 */
export function BookingListContainer() {
  const {
    data: bookings = [],
    isLoading,
    error,
    isError,
  } = useMyBookingsQuery();

  // 컬럼 생성
  const columns = createBookingColumns();

  return (
    <div className="wrapper my-4 pb-4">
      {/* 에러 표시 */}
      {isError && (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10">
          {error?.message || "데이터를 불러오는 중 오류가 발생했습니다."}
        </div>
      )}

      {/* 데이터 테이블 */}
      <BookingDataTable
        columns={columns}
        data={bookings}
        searchPlaceholder="공연명 또는 예매번호로 검색..."
        isLoading={isLoading}
      />
    </div>
  );
}
