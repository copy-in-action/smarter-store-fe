"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/shared/ui/popover";
import {
  SearchAutocomplete,
  addRecentSearch,
} from "@/features/service/performance-search";

/**
 * 검색 입력 컴포넌트
 * 검색창과 자동완성 기능을 제공합니다
 */
export function SearchInput() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 검색 실행 핸들러
   * @param keyword - 검색할 키워드
   */
  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    setIsOpen(false);
    setSearchQuery("");

    /**
     * 검색 결과 페이지로 이동
     * TODO: 실제 검색 결과 페이지 경로로 수정 필요
     */
    router.push(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  /**
   * Enter 키 입력 핸들러
   * @param e - 키보드 이벤트
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  /**
   * 검색어 전체 삭제 핸들러
   */
  const handleClear = () => {
    setSearchQuery("");
  };

  /**
   * Input 포커스 핸들러
   * Popover 열기
   */
  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative flex items-center h-full">
          <Search className="absolute start-5 size-4 text-muted-foreground z-10" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="어디로 떠나볼까요 ?"
            className="h-full py-0 border-blue-600 rounded-full ps-10 pe-12 placeholder:text-sm sm:bg-gray-100 sm:border-transparent sm:placeholder:text-lg"
            type="search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute end-2 size-8 z-10"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SearchAutocomplete
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      </PopoverContent>
    </Popover>
  );
}
