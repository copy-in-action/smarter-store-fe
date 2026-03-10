"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchInfiniteQuery } from "@/features/service/performance-search";
import type { PerformanceSearchSort } from "@/shared/api/orval/types";
import type { FilterState } from "./FilterDialog";
import { PerformanceSearchCard } from "./PerformanceSearchCard";

/**
 * 검색 결과 리스트 Props
 */
interface SearchResultsListProps {
  /** 검색어 */
  keyword: string;
  /** 필터 상태 */
  filters: FilterState;
  /** 정렬 방식 */
  sort: PerformanceSearchSort;
}

/**
 * 검색 결과 리스트 컴포넌트
 * - 무한 스크롤 지원
 * - 2열 그리드 레이아웃
 */
export function SearchResultsList({
  keyword,
  filters,
  sort,
}: SearchResultsListProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 Query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchInfiniteQuery({
    keyword,
    ...filters,
    sort,
  });

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>검색 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-destructive">
          <p>검색 중 오류가 발생했습니다</p>
          <p className="text-sm text-muted-foreground mt-2">
            잠시 후 다시 시도해주세요
          </p>
        </div>
      </div>
    );
  }

  // 전체 검색 결과
  const allPerformances = data?.pages.flatMap((page) => page.content) ?? [];

  // 빈 상태
  if (allPerformances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          다른 검색어로 시도해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* 2열 그리드 레이아웃 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {allPerformances.map((performance) => (
          <PerformanceSearchCard
            key={performance.id}
            performance={performance}
          />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          )}
        </div>
      )}
    </div>
  );
}
