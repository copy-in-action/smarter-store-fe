/**
 * 최근 검색어 항목
 */
export interface RecentSearch {
  /** 검색 키워드 */
  keyword: string;
  /** 검색 시간 (ISO 8601 형식) */
  searchedAt: string;
}
