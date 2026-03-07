"use client";

import { RecentSearches } from "./RecentSearches";

/**
 * 검색 자동완성 컴포넌트 Props
 */
interface SearchAutocompleteProps {
  /** 현재 검색어 */
  searchQuery: string;
  /** 검색 실행 함수 */
  onSearch: (keyword: string) => void;
}

/**
 * 검색 자동완성 영역 컴포넌트
 * 검색어 입력 여부에 따라 최근 검색 또는 검색 결과를 표시합니다
 * @param props - 컴포넌트 props
 * @returns 자동완성 UI
 */
export function SearchAutocomplete({
  searchQuery,
  onSearch,
}: SearchAutocompleteProps) {
  const trimmedQuery = searchQuery.trim();

  /**
   * 검색어가 없으면 최근 검색을 표시
   * 검색어가 있으면 추후 PerformanceResults 표시 (현재는 최근 검색만 구현)
   */
  if (!trimmedQuery) {
    return <RecentSearches onSearchClick={onSearch} />;
  }

  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      검색 결과는 추후 구현 예정입니다
    </div>
  );
}
