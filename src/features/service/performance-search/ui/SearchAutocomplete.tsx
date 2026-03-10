"use client";

import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";
import { PerformanceResults } from "./PerformanceResults";
import { RecentSearches } from "./RecentSearches";

/**
 * 검색 자동완성 팝오버 컴포넌트 Props
 */
interface SearchAutocompleteProps {
  /** 검색 키워드 (디바운싱 적용된 값) */
  keyword: string;
  /** 팝오버 열림 상태 */
  open: boolean;
  /** 팝오버 열림 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 검색어 클릭 시 호출될 콜백 */
  onSearchClick?: (keyword: string) => void;
  /** 공연 클릭 시 호출될 콜백 */
  onPerformanceClick?: () => void;
  /** 키보드 네비게이션으로 선택된 항목 인덱스 (-1: 선택 없음) */
  selectedIndex?: number;
  /** 자동완성 아이템 개수 변경 시 호출될 콜백 */
  onItemCountChange?: (count: number) => void;
  /** Popover Anchor 요소 */
  children: React.ReactNode;
  /** 외부 상호작용 시 호출될 콜백 */
  onInteractOutside?: (event: Event) => void;
}

/**
 * 검색 자동완성 팝오버 컴포넌트
 * - 검색어 미입력: 최근 검색 영역 표시
 * - 검색어 입력: 공연 검색 결과 표시 (최대 6개)
 */
export function SearchAutocomplete({
  keyword,
  open,
  onOpenChange,
  onSearchClick,
  onPerformanceClick,
  selectedIndex = -1,
  onItemCountChange,
  children,
  onInteractOutside,
}: SearchAutocompleteProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={onInteractOutside}
      >
        {!keyword ? (
          <RecentSearches
            onSearchClick={onSearchClick}
            selectedIndex={selectedIndex}
            onItemCountChange={onItemCountChange}
          />
        ) : (
          <PerformanceResults
            keyword={keyword}
            onPerformanceClick={onPerformanceClick}
            selectedIndex={selectedIndex}
            onItemCountChange={onItemCountChange}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
