"use client";

import { ArrowLeft, Home, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PerformanceSearchStatus } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { formatRegionName } from "@/shared/lib/region";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/widgets/header/ui/SearchInput";
import type { FilterState } from "./FilterDialog";

/**
 * 검색 헤더 Props
 */
interface SearchHeaderProps {
  /** 검색어 */
  keyword: string;
  /** 현재 필터 상태 */
  filters: FilterState;
  /** 필터 태그 제거 핸들러 */
  onRemoveFilter: (type: keyof FilterState, value: string) => void;
}

/**
 * 판매 상태 한글 매핑
 */
const STATUS_KOREAN_MAP: Record<PerformanceSearchStatus, string> = {
  [PerformanceSearchStatus.ON_SALE]: "판매중",
  [PerformanceSearchStatus.CLOSED]: "판매종료",
  [PerformanceSearchStatus.UPCOMING]: "판매예정",
};

/**
 * 검색 헤더 컴포넌트
 * - 뒤로가기 버튼
 * - 검색창 (재사용)
 * - 필터 태그 표시 및 삭제
 * - 홈 버튼
 */
export function SearchHeader({
  keyword,
  filters,
  onRemoveFilter,
}: SearchHeaderProps) {
  const router = useRouter();

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 선택된 모든 필터 태그 수집
   * filters가 변경될 때만 재계산
   */
  const filterTags = useMemo(() => {
    const tags: Array<{
      type: keyof FilterState;
      value: string;
      label: string;
    }> = [];

    // 판매 상태 태그
    filters.status?.forEach((status) => {
      tags.push({
        type: "status",
        value: status,
        label: STATUS_KOREAN_MAP[status],
      });
    });

    // 장르 태그
    filters.category?.forEach((category) => {
      tags.push({
        type: "category",
        value: category,
        label: category,
      });
    });

    // 지역 태그
    filters.region?.forEach((region) => {
      tags.push({
        type: "region",
        value: region,
        label: formatRegionName(region),
      });
    });

    return tags;
  }, [filters]);

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="container max-w-screen-lg mx-auto px-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-2 py-3">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* 검색창 (SearchInput 재사용) */}
          <div className="flex-1">
            <SearchInput />
          </div>

          {/* 홈 버튼 */}
          <Link href={PAGES.HOME.path} className="flex-shrink-0 p-2">
            <Home className="size-6" />
          </Link>
        </div>

        {/* 선택된 필터 태그 */}
        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3">
            {filterTags.map((tag, index) => (
              <Badge
                key={`${tag.type}-${tag.value}-${index}`}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => onRemoveFilter(tag.type, tag.value)}
              >
                <span>{tag.label}</span>
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
