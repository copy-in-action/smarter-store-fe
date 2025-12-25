"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PAGES } from "@/shared/constants";
import { useCreatePerformance } from "../lib/usePerformanceQueries";
import type { PerformanceFormData } from "../model/performance-form.schema";
import { PerformanceForm } from "./PerformanceForm";

/**
 * 공연 생성 폼 컴포넌트
 */
export function PerformanceCreateForm() {
  const router = useRouter();
  const createPerformanceMutation = useCreatePerformance();

  /**
   * 공연 생성 제출 핸들러
   * @param data - 폼 데이터 (Zod 스키마에서 이미 변환됨)
   */
  const handleSubmit = async (data: PerformanceFormData) => {
    try {
      await createPerformanceMutation.mutateAsync(data);

      toast.success("공연이 성공적으로 등록되었습니다.");
      router.push(PAGES.ADMIN.PERFORMANCES.LIST.path);
    } catch (error) {
      console.error("공연 등록 오류:", error);
      toast.error("공연 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    router.push(PAGES.ADMIN.PERFORMANCES.LIST.path);
  };

  return (
    <PerformanceForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createPerformanceMutation.isPending}
      onCancel={handleCancel}
    />
  );
}
