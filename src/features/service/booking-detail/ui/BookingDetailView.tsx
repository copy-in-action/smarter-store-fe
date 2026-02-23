"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  BookingStatusBadge,
  useBookingDetailQuery,
  useCancelBookingMutation,
} from "@/entities/booking";
import { PAGES } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { BookingPaymentInfo } from "./BookingPaymentInfo";

/**
 * 예매 상세 뷰 속성
 */
interface BookingDetailViewProps {
  /** 예매 ID */
  bookingId: string;
}

/**
 * 예매 상세 정보를 표시하는 메인 컴포넌트
 */
export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const router = useRouter();
  const {
    data: booking,
    isLoading,
    error,
    isError,
  } = useBookingDetailQuery(bookingId);
  const cancelBookingMutation = useCancelBookingMutation();

  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  /** 공연 시작 전인지 확인 */
  const isBeforeShowTime = booking?.showDateTime
    ? new Date(booking.showDateTime).getTime() > Date.now()
    : false;

  /**
   * 취소 가능 여부 확인:
   * - 공연 시작 전이어야 함
   * - 상태가 CONFIRMED(예매 확정) 또는 PENDING(결제 대기)이어야 함
   */
  const canCancel =
    isBeforeShowTime &&
    (booking?.status === "CONFIRMED" || booking?.status === "PENDING");

  /**
   * 목록으로 돌아가기
   */
  const handleBackToList = () => {
    router.back();
  };

  /**
   * 예매 취소 확인 핸들러
   */
  const handleConfirmCancel = async () => {
    try {
      await cancelBookingMutation.mutateAsync(bookingId);
      toast.success("예매가 성공적으로 취소되었습니다.");
      setShowCancelDialog(false);
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "예매 취소에 실패했습니다.";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            예매 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          목록
        </Button>
        <div className="p-8 border border-destructive rounded-md bg-destructive/10 text-center">
          <p className="text-destructive font-medium">
            {error?.message || "예매 정보를 불러올 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* 상단 액션 바 */}
        <div className="flex items-center justify-end gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelBookingMutation.isPending}
            >
              예매 취소
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="gap-2"
          >
            목록
          </Button>
        </div>

        {/* 기본 정보 카드 */}
        <h1 className="font-bold text-2xl mb-2">공연</h1>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xl">
              <Link
                href={PAGES.PERFORMANCE.DETAIL.path(booking.performanceId)}
                className="hover:underline hover:underline-offset-4"
                target="_blank"
              >
                {booking.performanceTitle}
              </Link>
            </p>
            <p className="text-gray-400">예매번호: {booking.bookingNumber}</p>
          </div>
          <BookingStatusBadge status={booking.status} className="p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 mb-10">
          <div>
            <p className="text-sm text-muted-foreground">공연 일시</p>
            <p className="font-medium">
              {formatDate(booking.showDateTime, "YYYY-MM-DD HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">예매 일시</p>
            <p className="font-medium">
              {formatDate(booking.createdAt, "YYYY-MM-DD HH:mm")}
            </p>
          </div>
        </div>

        {/* 결제 정보 */}
        <BookingPaymentInfo booking={booking} />
      </div>

      {/* 예매 취소 확인 다이얼로그 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예매를 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              예매번호: {booking.bookingNumber}
              <br />
              공연명: {booking.performanceTitle}
              <br />
              <br />
              취소 시 환불 정책에 따라 처리됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
