"use client";

import { PerformanceCreateForm } from "@/features/admin/performance-management";
import { BackButton } from "@/shared/ui/BackButton";

/**
 * 관리자 공연 생성 페이지 뷰 컴포넌트
 */
export default function PerformanceCreateView() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공연 등록</h1>
          <p className="text-muted-foreground">
            새로운 공연 정보를 등록합니다.
          </p>
        </div>
      </div>

      {/* 공연 생성 폼 */}
      <PerformanceCreateForm />
    </div>
  );
}
