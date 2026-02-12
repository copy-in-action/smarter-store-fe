import { Badge } from "@/shared/ui/badge";
import type { BookingStatus } from "../api/booking.api";

/**
 * 예매 상태 배지 속성
 */
interface BookingStatusBadgeProps {
  /** 예매 상태 */
  status: BookingStatus;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 예매 상태별 라벨 및 색상 매핑
 */
const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "결제 대기", variant: "outline" },
  CONFIRMED: { label: "예매 확정", variant: "default" },
  CANCELLED: { label: "취소됨", variant: "destructive" },
  EXPIRED: { label: "만료됨", variant: "secondary" },
};

/**
 * 예매 상태를 시각적으로 표시하는 Badge 컴포넌트
 * @param status - 예매 상태
 * @param className - 추가 클래스명
 * @returns Badge 컴포넌트
 */
export function BookingStatusBadge({
  status,
  className,
}: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
