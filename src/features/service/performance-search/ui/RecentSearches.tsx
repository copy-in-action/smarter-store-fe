"use client";

import { Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "../model/recent-search";
import type { RecentSearch } from "../model/search.types";

/**
 * 최근 검색 영역 컴포넌트 Props
 */
interface RecentSearchesProps {
  /** 검색어 클릭 시 호출될 콜백 */
  onSearchClick?: (keyword: string) => void;
  /** 키보드 네비게이션으로 선택된 항목 인덱스 (-1: 선택 없음) */
  selectedIndex?: number;
  /** 아이템 개수 변경 시 호출될 콜백 */
  onItemCountChange?: (count: number) => void;
}

/**
 * 최근 검색 영역 컴포넌트
 * - 최근 검색어 목록 표시 (최대 4개, 최신순)
 * - 개별 삭제 및 전체 삭제 기능
 * - 쿠키 기반 저장
 */
export function RecentSearches({
  onSearchClick,
  selectedIndex = -1,
  onItemCountChange,
}: RecentSearchesProps) {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  // 컴포넌트 마운트 시 최근 검색어 로드
  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  // 부모에게 아이템 개수 보고
  useEffect(() => {
    onItemCountChange?.(searches.length);
  }, [searches, onItemCountChange]);

  /**
   * 개별 검색어 삭제 핸들러
   */
  const handleRemove = (keyword: string) => {
    removeRecentSearch(keyword);
    setSearches(getRecentSearches());
  };

  /**
   * 전체 삭제 핸들러
   */
  const handleClearAll = () => {
    clearRecentSearches();
    setSearches([]);
  };

  /**
   * 검색어 클릭 핸들러
   */
  const handleSearchClick = (keyword: string) => {
    onSearchClick?.(keyword);
  };

  // 빈 상태
  if (searches.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        최근 검색 내역이 없어요
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-medium">최근 검색</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          전체삭제
        </Button>
      </div>

      {/* 검색어 목록 */}
      <div className="space-y-1" role="listbox">
        {searches.map((search, index) => (
          <div
            key={search.keyword}
            role="option"
            tabIndex={-1}
            aria-selected={index === selectedIndex}
            data-autocomplete-index={index}
            onClick={() => handleSearchClick(search.keyword)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClick(search.keyword);
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 transition-colors group cursor-pointer",
              index === selectedIndex ? "bg-accent" : "hover:bg-accent",
            )}
          >
            {/* 시계 아이콘 + 검색어 */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{search.keyword}</span>
            </div>

            {/* 개별 삭제 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(search.keyword);
              }}
              className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
