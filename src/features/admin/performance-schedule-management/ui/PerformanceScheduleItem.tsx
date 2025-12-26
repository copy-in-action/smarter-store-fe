import { Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import type { PerformanceScheduleResponse } from "@/shared/api/orval/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/ui/item";
import {
  canDeleteSchedule,
  formatDateTime,
  getScheduleStatus,
} from "../lib/utils";

/**
 * 공연 회차 아이템 컴포넌트 속성
 */
interface PerformanceScheduleItemProps {
  /** 공연 회차 정보 */
  schedule: PerformanceScheduleResponse;
  /** 공연 ID */
  performanceId: number;
  /** 삭제 핸들러 */
  onDelete: (scheduleId: number) => void;
  /** 삭제 로딩 상태 */
  isDeleting?: boolean;
}

/**
 * 공연 회차 목록 아이템 컴포넌트
 * @param schedule - 공연 회차 정보
 * @param performanceId - 공연 ID
 * @param onDelete - 삭제 핸들러
 * @param isDeleting - 삭제 로딩 상태
 */
export function PerformanceScheduleItem({
  schedule,
  performanceId,
  onDelete,
  isDeleting = false,
}: PerformanceScheduleItemProps) {
  const status = getScheduleStatus(schedule);
  const isDeletable = canDeleteSchedule(schedule);

  /**
   * 상태에 따른 뱃지 색상 결정
   */
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "종료":
        return "secondary" as const;
      case "판매 중":
        return "default" as const;
      case "판매 예정":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Item variant="outline" asChild>
      <Link
        href={`/admin/performances/${performanceId}/schedules/${schedule.id}`}
      >
        <ItemMedia variant="icon">
          <Calendar className="size-4" />
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {formatDateTime(schedule.showDateTime)}
            <Badge variant={getStatusVariant(status)}>{status}</Badge>
          </ItemTitle>
          <ItemDescription>
            예매 시작: {formatDateTime(schedule.saleStartDateTime)}
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          {isDeletable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                const isDelete = confirm("해당 공연 회차를 삭제하시겠습니까?");
                if (!isDelete) return;
                onDelete(schedule.id);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </ItemActions>
      </Link>
    </Item>
  );
}
