import Cookies from "js-cookie";
import type { RecentSearch } from "./search.types";

/** 최근 검색어 쿠키 키 */
const RECENT_SEARCH_COOKIE_KEY = "recent_searches";

/** 최대 저장 개수 */
const MAX_RECENT_SEARCHES = 4;

/** 쿠키 만료 기간 (30일) */
const COOKIE_MAX_AGE = 30;

/**
 * 최근 검색어 목록을 가져옵니다
 * @returns 최근 검색어 배열 (최신순)
 */
export function getRecentSearches(): RecentSearch[] {
  const cookie = Cookies.get(RECENT_SEARCH_COOKIE_KEY);
  if (!cookie) {
    return [];
  }

  try {
    const searches = JSON.parse(cookie) as RecentSearch[];
    return searches;
  } catch {
    return [];
  }
}

/**
 * 검색어를 최근 검색어 목록에 추가합니다
 * @param keyword - 추가할 검색어
 */
export function addRecentSearch(keyword: string): void {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return;
  }

  const searches = getRecentSearches();

  /**
   * 중복 검색어 제거 로직
   * - 이미 존재하는 검색어는 제거하고 최신 시간으로 맨 앞에 추가
   */
  const filteredSearches = searches.filter(
    (search) => search.keyword !== trimmedKeyword,
  );

  const newSearch: RecentSearch = {
    keyword: trimmedKeyword,
    searchedAt: new Date().toISOString(),
  };

  const updatedSearches = [newSearch, ...filteredSearches].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  Cookies.set(RECENT_SEARCH_COOKIE_KEY, JSON.stringify(updatedSearches), {
    expires: COOKIE_MAX_AGE,
  });
}

/**
 * 특정 검색어를 최근 검색어 목록에서 제거합니다
 * @param keyword - 제거할 검색어
 */
export function removeRecentSearch(keyword: string): void {
  const searches = getRecentSearches();
  const filteredSearches = searches.filter(
    (search) => search.keyword !== keyword,
  );

  if (filteredSearches.length === 0) {
    Cookies.remove(RECENT_SEARCH_COOKIE_KEY);
  } else {
    Cookies.set(RECENT_SEARCH_COOKIE_KEY, JSON.stringify(filteredSearches), {
      expires: COOKIE_MAX_AGE,
    });
  }
}

/**
 * 모든 최근 검색어를 삭제합니다
 */
export function clearRecentSearches(): void {
  Cookies.remove(RECENT_SEARCH_COOKIE_KEY);
}
