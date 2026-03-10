"use client";

import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 필터 바 Props
 */
interface FilterBarProps {
  /** 필터 버튼 클릭 핸들러 */
  onFilterClick: () => void;
  /** 정렬 버튼 클릭 핸들러 */
  onSortClick: () => void;
}

/**
 * 필터 바 컴포넌트
 * - 필터 버튼
 * - 정렬 버튼
 */
export function FilterBar({ onFilterClick, onSortClick }: FilterBarProps) {
  return (
    <div className="flex gap-2 py-3 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={onFilterClick}
        className="gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>필터</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onSortClick}
        className="gap-2"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>정렬</span>
      </Button>
    </div>
  );
}
