"use client";

import { usePerformances } from "@/entities/performance";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PerformanceCarousel } from "./PerformanceCarousel";
import { PerformanceEmpty } from "./PerformanceEmpty";
import { PerformanceListSkeleton } from "./PerformanceListSkeleton";

/**
 * 공연 리스트 props
 */
interface PerformanceListProps {
  /** 서버에서 전달받은 초기 데이터 */
  initialData: PerformanceResponse[];
}

/**
 * 공연 리스트 에러 상태
 */
function PerformanceListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 wrapper sm:px-10!">
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="mb-2 text-red-500">
            공연 정보를 불러오는데 실패했습니다.
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-blue-500 underline hover:text-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 공연 리스트 컴포넌트 (Server + Client 통합)
 */
export function PerformanceList({ initialData }: PerformanceListProps) {
  const {
    data: performances = initialData,
    isLoading,
    error,
    refetch,
  } = usePerformances({
    initialData,
    staleTime: initialData.length > 0 ? 1000 * 60 * 5 : 0,
  });

  if (isLoading) {
    return <PerformanceListSkeleton />;
  }

  if (error) {
    return <PerformanceListError onRetry={() => refetch()} />;
  }

  if (!performances || performances.length === 0) {
    return <PerformanceEmpty />;
  }

  return <PerformanceCarousel performances={performances} />;
}
