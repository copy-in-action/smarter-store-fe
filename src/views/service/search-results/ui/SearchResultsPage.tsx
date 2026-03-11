"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  PerformanceSearchSort,
  type PerformanceSearchStatus,
  type Region,
} from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { FilterBar } from "./FilterBar";
import { FilterDialog, type FilterState } from "./FilterDialog";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsList } from "./SearchResultsList";
import { SortDialog } from "./SortDialog";

/**
 * 검색 결과 페이지 컴포넌트
 * - URL 쿼리 파라미터로 상태 관리
 * - 필터/정렬 다이얼로그
 * - 무한 스크롤 검색 결과 리스트
 */
export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 상태 읽기
  const keyword = searchParams.get("q") || "";
  const statusParams = searchParams.getAll(
    "status",
  ) as PerformanceSearchStatus[];
  const categoryParams = searchParams.getAll("category");
  const regionParams = searchParams.getAll("region") as Region[];
  const sortParam =
    (searchParams.get("sort") as PerformanceSearchSort) ??
    PerformanceSearchSort.CREATED_AT_DESC;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 현재 필터 상태
  const currentFilters: FilterState = {
    status: statusParams,
    category: categoryParams,
    region: regionParams,
  };

  /**
   * URL 쿼리 파라미터 업데이트 헬퍼
   * @param newFilters - 새로운 필터 상태
   * @param newSort - 새로운 정렬 방식 (선택적)
   */
  const updateURL = (
    newFilters: FilterState,
    newSort?: PerformanceSearchSort,
  ) => {
    const finalSort = newSort ?? sortParam;

    // PAGES 상수를 사용하여 검색 URL 생성
    const searchPath = PAGES.SEARCH.path({
      q: keyword || undefined,
      category: newFilters.category?.length ? newFilters.category : undefined,
      status: newFilters.status?.length ? newFilters.status : undefined,
      region: newFilters.region?.length ? newFilters.region : undefined,
      sort: finalSort || undefined,
    });

    router.push(searchPath);
  };

  /**
   * 필터 적용 핸들러
   * @param filters - 적용할 필터
   */
  const handleApplyFilters = (filters: FilterState) => {
    updateURL(filters);
  };

  /**
   * 정렬 선택 핸들러
   * @param sort - 선택된 정렬 방식
   */
  const handleSelectSort = (sort: PerformanceSearchSort) => {
    updateURL(currentFilters, sort);
  };

  /**
   * 필터 태그 제거 핸들러
   * @param type - 필터 타입
   * @param value - 제거할 값
   */
  const handleRemoveFilter = (type: keyof FilterState, value: string) => {
    const newFilters = { ...currentFilters };

    if (type === "status") {
      newFilters.status = currentFilters.status?.filter((s) => s !== value);
    } else if (type === "category") {
      newFilters.category = currentFilters.category?.filter((c) => c !== value);
    } else if (type === "region") {
      newFilters.region = currentFilters.region?.filter((r) => r !== value);
    }

    updateURL(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <SearchHeader
        keyword={keyword}
        filters={currentFilters}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* 메인 콘텐츠 */}
      <div className="container max-w-screen-lg mx-auto px-4">
        {/* 필터/정렬 버튼 */}
        <FilterBar
          onFilterClick={() => setIsFilterOpen(true)}
          onSortClick={() => setIsSortOpen(true)}
        />

        {/* 검색 결과 리스트 */}
        <SearchResultsList
          keyword={keyword}
          filters={currentFilters}
          sort={sortParam}
        />
      </div>

      {/* 필터 다이얼로그 */}
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentFilters={currentFilters}
        keyword={keyword}
        onApplyFilters={handleApplyFilters}
      />

      {/* 정렬 다이얼로그 */}
      <SortDialog
        open={isSortOpen}
        onOpenChange={setIsSortOpen}
        currentSort={sortParam}
        onSelectSort={handleSelectSort}
      />
    </div>
  );
}
