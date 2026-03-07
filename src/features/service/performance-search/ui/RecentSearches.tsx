"use client";

import { Clock, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
} from "../model/recent-search";
import type { RecentSearch } from "../model/search.types";

/**
 * 최근 검색 컴포넌트 Props
 */
interface RecentSearchesProps {
  /** 검색어 클릭 시 호출되는 함수 */
  onSearchClick: (keyword: string) => void;
}

/**
 * 최근 검색 영역 컴포넌트
 * 최근 검색어 목록을 표시하고 관리합니다
 * @param props - 컴포넌트 props
 * @returns 최근 검색 UI
 */
export function RecentSearches({ onSearchClick }: RecentSearchesProps) {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  /**
   * 개별 검색어 삭제 핸들러
   * @param keyword - 삭제할 검색어
   */
  const handleRemove = (keyword: string) => {
    removeRecentSearch(keyword);
    setSearches(getRecentSearches());
  };

  /**
   * 전체 검색어 삭제 핸들러
   */
  const handleClearAll = () => {
    clearRecentSearches();
    setSearches([]);
  };

  if (searches.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        최근 검색 내역이 없어요
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">최근 검색</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          전체삭제
        </Button>
      </div>

      <ul className="space-y-2">
        {searches.map((search) => (
          <li
            key={search.keyword}
            className="flex items-center justify-between group"
          >
            <button
              onClick={() => onSearchClick(search.keyword)}
              className="flex items-center gap-2 flex-1 text-left hover:text-blue-600 transition-colors"
            >
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">{search.keyword}</span>
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(search.keyword)}
              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
