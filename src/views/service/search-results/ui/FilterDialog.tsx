"use client";

import { useEffect, useState } from "react";
import { CATEGORY_OPTIONS } from "@/entities/performance";
import { useSearchQuery } from "@/features/service/performance-search";
import { PerformanceSearchStatus, type Region } from "@/shared/api/orval/types";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import { REGION_KOREAN_MAP } from "@/shared/lib/region";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

/**
 * 필터 상태 타입
 */
export interface FilterState {
  /** 판매 상태 필터 */
  status?: PerformanceSearchStatus[];
  /** 장르 필터 */
  category?: string[];
  /** 지역 필터 */
  region?: Region[];
}

/**
 * 필터 다이얼로그 Props
 */
interface FilterDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 현재 필터 상태 */
  currentFilters: FilterState;
  /** 검색어 */
  keyword: string;
  /** 필터 적용 핸들러 */
  onApplyFilters: (filters: FilterState) => void;
}

/**
 * 판매 상태 옵션
 */
const STATUS_OPTIONS = [
  { label: "판매중", value: PerformanceSearchStatus.ON_SALE },
  { label: "판매종료", value: PerformanceSearchStatus.CLOSED },
];

/**
 * 지역 옵션 (Region enum 기반)
 */
const REGION_OPTIONS = Object.entries(REGION_KOREAN_MAP).map(
  ([value, label]) => ({
    label,
    value: value as Region,
  }),
);

/**
 * 필터 다이얼로그 컴포넌트
 * - 실시간 totalElements 표시
 * - 초기화 버튼은 필터 선택 시만 활성화
 */
export function FilterDialog({
  open,
  onOpenChange,
  currentFilters,
  keyword,
  onApplyFilters,
}: FilterDialogProps) {
  const [selectedFilters, setSelectedFilters] =
    useState<FilterState>(currentFilters);

  // 다이얼로그 열릴 때마다 현재 필터로 초기화
  useEffect(() => {
    if (open) {
      setSelectedFilters(currentFilters);
    }
  }, [open, currentFilters]);

  // 필터 변경 시 실시간 totalElements 조회 (디바운싱 적용)
  const debouncedFilters = useDebounce(selectedFilters, 300);

  const { data, isFetched } = useSearchQuery({
    keyword,
    ...debouncedFilters,
    page: 0,
    size: 1, // 최소한의 데이터만 가져옴 (totalElements만 필요)
  });

  const totalElements = data?.totalElements ?? 0;

  // 필터가 하나라도 선택되었는지 확인
  const hasFilters = !!(
    selectedFilters.status?.length ||
    selectedFilters.category?.length ||
    selectedFilters.region?.length
  );

  /**
   * 토글 버튼 클릭 핸들러
   * @param type - 필터 타입
   * @param value - 토글할 값
   */
  const toggleFilter = <T extends string>(
    type: keyof FilterState,
    value: T,
  ) => {
    setSelectedFilters((prev) => {
      const currentArray = (prev[type] as T[]) ?? [];
      const isSelected = currentArray.includes(value);

      return {
        ...prev,
        [type]: isSelected
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  };

  /**
   * 초기화 핸들러
   */
  const handleReset = () => {
    setSelectedFilters({ status: [], category: [], region: [] });
  };

  /**
   * 적용 핸들러
   */
  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>필터</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 판매 상태 */}
          <div>
            <h3 className="text-sm font-medium mb-3">판매 상태</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    selectedFilters.status?.includes(option.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleFilter("status", option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 장르 */}
          <div>
            <h3 className="text-sm font-medium mb-3">장르</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    selectedFilters.category?.includes(option.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleFilter("category", option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <h3 className="text-sm font-medium mb-3">지역</h3>
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    selectedFilters.region?.includes(option.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleFilter("region", option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasFilters}
            className="flex-shrink-0"
          >
            초기화
          </Button>

          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={!isFetched || totalElements === 0}
          >
            {totalElements}개 상품 보기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
