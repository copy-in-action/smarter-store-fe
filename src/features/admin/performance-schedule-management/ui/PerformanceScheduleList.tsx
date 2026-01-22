"use client";

import { toast } from "sonner";
import { ItemGroup, ItemSeparator } from "@/shared/ui/item";
import {
  useDeletePerformanceSchedule,
  useGetPerformanceSchedules,
} from "../api/performanceSchedule.queries";
import { sortSchedulesByShowTime } from "../lib/utils";
import { PerformanceScheduleItem } from "./PerformanceScheduleItem";

/**
 * 공연 회차 목록 컴포넌트 속성
 */
interface PerformanceScheduleListProps {
  /** 공연 ID */
  performanceId: number;
}

/**
 * 공연 회차 목록 컴포넌트
 * @param performanceId - 공연 ID
 */
export function PerformanceScheduleList({
  performanceId,
}: PerformanceScheduleListProps) {
  const {
    data: schedules,
    isLoading,
    error,
  } = useGetPerformanceSchedules(performanceId);
  const deleteScheduleMutation = useDeletePerformanceSchedule();

  /**
   * 회차 삭제 핸들러
   * @param scheduleId - 삭제할 회차 ID
   */
  const handleDelete = async (scheduleId: number) => {
    try {
      await deleteScheduleMutation.mutateAsync(scheduleId);
      toast.success("공연 회차가 삭제되었습니다");
    } catch (error) {
      toast.error("공연 회차 삭제에 실패했습니다");
      console.error("공연 회차 삭제 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">
          공연 회차 목록을 불러오는데 실패했습니다
        </div>
      </div>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">등록된 공연 회차가 없습니다</div>
      </div>
    );
  }

  // showDateTime 최신순으로 정렬
  const sortedSchedules = sortSchedulesByShowTime(schedules);

  return (
    <ItemGroup className="max-w-xl">
      {sortedSchedules.map((schedule, index) => (
        <div key={schedule.id}>
          <PerformanceScheduleItem
            schedule={schedule}
            performanceId={performanceId}
            onDelete={handleDelete}
            isDeleting={deleteScheduleMutation.isPending}
          />
          {index < sortedSchedules.length - 1 && <ItemSeparator />}
        </div>
      ))}
    </ItemGroup>
  );
}
