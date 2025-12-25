"use client";

import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  formatDateTime,
  getScheduleStatus,
  PerformanceScheduleForm,
  useDeletePerformanceSchedule,
  useGetPerformanceSchedule,
  useUpdatePerformanceSchedule,
} from "@/features/admin/performance-schedule-management";
import { PAGES } from "@/shared/constants/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

/**
 * 공연 회차 상세 뷰 속성
 */
interface PerformanceScheduleDetailViewProps {
  /** 공연 ID */
  performanceId: number;
  /** 회차 ID */
  scheduleId: number;
}

/**
 * 공연 회차 상세 뷰 컴포넌트
 * @param performanceId - 공연 ID
 * @param scheduleId - 회차 ID
 */
export function PerformanceScheduleDetailView({
  performanceId,
  scheduleId,
}: PerformanceScheduleDetailViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: schedule, isLoading } = useGetPerformanceSchedule(scheduleId);
  const updateMutation = useUpdatePerformanceSchedule();
  const deleteMutation = useDeletePerformanceSchedule();

  /**
   * 수정 모드 토글
   */
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  /**
   * 수정 완료 핸들러
   */
  const handleUpdateSuccess = () => {
    setIsEditMode(false);
    toast.success("공연 회차가 성공적으로 수정되었습니다");
  };

  /**
   * 회차 삭제 핸들러
   */
  const handleDelete = async () => {
    const isConfirm = confirm("해당 공연 회차를 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteMutation.mutateAsync(scheduleId);
      toast.success("공연 회차가 성공적으로 삭제되었습니다");
      // 회차 목록 페이지로 리디렉션
      window.location.href =
        PAGES.ADMIN.PERFORMANCES.SCHEDULE_LIST.path(performanceId);
    } catch (error) {
      toast.error("공연 회차 삭제에 실패했습니다");
      console.error("회차 삭제 실패:", error);
    }
  };

  const status = useMemo(() => {
    if (!schedule) return "";
    return getScheduleStatus(schedule);
  }, [schedule]);

  /**
   * 상태에 따른 뱃지 색상 결정
   */
  const getStatusVariant = useCallback((status: string) => {
    switch (status) {
      case "종료":
        return { variant: "secondary" as const, bgColor: "bg-red-600" };
      case "판매 중":
        return { variant: "default" as const, bgColor: "bg-green-600" };
      case "판매 예정":
        return { variant: "outline" as const, bgColor: "bg-teal-600" };
      default:
        return { variant: "outline" as const, bgColor: "bg-green-200" };
    }
  }, []);

  const badgeData = useMemo(() => {
    return getStatusVariant(status);
  }, [status, getStatusVariant]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              회차 정보를 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">공연 회차 상세</h1>
            <p className="text-muted-foreground">
              {formatDateTime(schedule.showDateTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={PAGES.ADMIN.PERFORMANCES.SCHEDULE_LIST.path(performanceId)}
          >
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
              목록
            </Button>
          </Link>
        </div>
      </div>

      {/* 컨텐츠 */}
      {isEditMode ? (
        <PerformanceScheduleForm
          performanceId={performanceId}
          schedule={schedule}
          onCancel={handleEditToggle}
          onSuccess={handleUpdateSuccess}
          mode="edit"
        />
      ) : (
        <div className="grid gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>
                기본 정보
                <Badge
                  variant={badgeData.variant}
                  className={`${badgeData.bgColor} text-white ms-4`}
                >
                  {status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  공연 시작 일시
                  <p className="mt-1 text-base">
                    {formatDateTime(schedule.showDateTime)}
                  </p>
                </div>
                <div>
                  예매 시작 일시
                  <p className="mt-1 text-base">
                    {formatDateTime(schedule.saleStartDateTime)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {schedule.ticketOptions?.map((option) => (
                  <div key={option.seatGrade} className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      {option.seatGrade} 등급
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {option.price?.toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 justify-end">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "삭제 중..." : "회차 삭제"}
              </Button>
              <Button onClick={handleEditToggle}>
                <Edit3 className="size-4 mr-2" />
                수정하기
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
