"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeletePerformance, usePerformance } from "@/entities/performance";
import { PerformanceDetail } from "@/features/performance-detail";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

/**
 * 공연 상세 뷰 속성
 */
interface PerformanceDetailViewProps {
  /** 공연 ID */
  performanceId: number;
}

/**
 * 공연 상세 페이지 뷰 컴포넌트
 */
export function PerformanceDetailView({
  performanceId,
}: PerformanceDetailViewProps) {
  const router = useRouter();

  // 공연 데이터 조회
  const {
    data: performance,
    isLoading,
    error,
  } = usePerformance(performanceId);

  // 공연 삭제 뮤테이션
  const deletePerformanceMutation = useDeletePerformance();

  /**
   * 수정 버튼 클릭 핸들러
   */
  const handleEdit = (performance: PerformanceResponse) => {
    router.push(PAGES.ADMIN.PERFORMANCES.EDIT.path(performance.id));
  };

  /**
   * 삭제 버튼 클릭 핸들러
   */
  const handleDelete = async (performance: PerformanceResponse) => {
    const isConfirmed = window.confirm(
      `'${performance.title}' 공연을 삭제하시겠습니까?\\n\\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deletePerformanceMutation.mutateAsync(performance.id);
      toast.success("공연이 성공적으로 삭제되었습니다.");
      router.push(PAGES.ADMIN.PERFORMANCES.LIST.path);
    } catch (error) {
      console.error("공연 삭제 실패:", error);
      toast.error("공연 삭제 중 오류가 발생했습니다.");
    }
  };

  /**
   * 목록으로 돌아가기 핸들러
   */
  const handleBackToList = () => {
    router.push(PAGES.ADMIN.PERFORMANCES.LIST.path);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex gap-3 justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">공연 상세</h1>
          <Button variant="outline" onClick={handleBackToList}>
            목록으로
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index.toString()}
                  className="h-6 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 상태
  if (error || !performance) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex gap-3 justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">공연 상세</h1>
          <Button variant="outline" onClick={handleBackToList}>
            목록으로
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-lg text-red-600 mb-4">
              {error instanceof Error
                ? "공연을 불러오는 중 오류가 발생했습니다."
                : "해당 공연을 찾을 수 없습니다."}
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-3 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공연 상세</h1>
        <Button variant="outline" onClick={handleBackToList}>
          목록으로
        </Button>
      </div>

      <PerformanceDetail
        performance={performance}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdminMode={true}
      />
    </div>
  );
}