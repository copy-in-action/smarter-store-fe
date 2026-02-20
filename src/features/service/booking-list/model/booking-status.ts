import { BookingStatus } from "@/entities/booking";

/**
 * 예매 상태 필터 옵션
 */
export const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: BookingStatus.PENDING, label: "결제 대기" },
  { value: BookingStatus.CONFIRMED, label: "예매 확정" },
  { value: BookingStatus.CANCELLED, label: "취소됨" },
  { value: BookingStatus.EXPIRED, label: "만료됨" },
];

/** 모든 상태 값 배열 */
export const ALL_STATUSES = STATUS_OPTIONS.map((option) => option.value);
