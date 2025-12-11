"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePerformance, useUpdatePerformance } from "@/entities/performance";
import { PerformanceForm } from "@/features/performance-form";
import type { PerformanceFormData } from "@/features/performance-form/model/performance-form.schema";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

/**
 * 공연 수정 뷰 속성
 */
interface PerformanceEditViewProps {
  /** 공연 ID */
  performanceId: number;
}

/**
 * 공연 수정 페이지 뷰 컴포넌트
 */
export function PerformanceEditView({
  performanceId,
}: PerformanceEditViewProps) {
  const router = useRouter();

  // 공연 데이터 조회
  const {
    data: performance,
    isLoading,
    error,
  } = usePerformance(performanceId);

  // 공연 수정 뮤테이션
  const updatePerformanceMutation = useUpdatePerformance();

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (data: PerformanceFormData) => {
    try {
      await updatePerformanceMutation.mutateAsync({
        id: performanceId,
        data: {
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          runningTime: data.runningTime ? Number(data.runningTime) : undefined,
          ageRating: data.ageRating || undefined,
          mainImageUrl: data.mainImageUrl || undefined,
          visible: data.visible,
          venueId: data.venueId,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });

      toast.success("공연 정보가 성공적으로 수정되었습니다.");
      router.push(PAGES.ADMIN.PERFORMANCES.DETAIL.path(performanceId));
    } catch (error) {
      console.error("공연 수정 실패:", error);
      toast.error("공연 수정 중 오류가 발생했습니다.");
      throw error;
    }
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    router.push(PAGES.ADMIN.PERFORMANCES.DETAIL.path(performanceId));
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
          <h1 className="text-2xl font-bold">공연 수정</h1>
          <Button variant="outline" onClick={handleBackToList}>
            목록으로
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index.toString()}
                  className="h-12 bg-gray-200 rounded animate-pulse"
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
          <h1 className="text-2xl font-bold">공연 수정</h1>
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
        <h1 className="text-2xl font-bold">공연 수정</h1>
        <Button variant="outline" onClick={handleBackToList}>
          목록으로
        </Button>
      </div>

      <PerformanceForm
        mode="edit"
        initialData={performance}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updatePerformanceMutation.isPending}
      />
    </div>
  );
}