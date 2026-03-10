'use client';

import Cookies from 'js-cookie';
import type { RecentSearch } from './search.types';

/** 최근 검색어 쿠키 키 */
const RECENT_SEARCH_COOKIE_KEY = 'recent_searches';

/** 최대 저장 개수 */
const MAX_RECENT_SEARCHES = 4;

/** 쿠키 만료 기간 (30일) */
const COOKIE_EXPIRES_DAYS = 30;

/**
 * 최근 검색어 목록을 조회합니다
 * @returns 최근 검색어 배열 (최신순)
 */
export const getRecentSearches = (): RecentSearch[] => {
  try {
    const cookie = Cookies.get(RECENT_SEARCH_COOKIE_KEY);
    if (!cookie) return [];

    const searches = JSON.parse(cookie) as RecentSearch[];

    // 날짜 기준 최신순 정렬
    return searches.sort(
      (a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
};

/**
 * 검색어를 최근 검색어 목록에 추가합니다
 * - 중복 검색어는 제거하고 최신으로 업데이트
 * - 최대 4개까지만 저장
 * @param keyword - 추가할 검색어
 */
export const addRecentSearch = (keyword: string): void => {
  if (!keyword.trim()) return;

  try {
    const searches = getRecentSearches();

    // 중복 제거 (대소문자 구분 없이)
    const filteredSearches = searches.filter(
      (search) => search.keyword.toLowerCase() !== keyword.toLowerCase()
    );

    // 새 검색어를 맨 앞에 추가
    const newSearches: RecentSearch[] = [
      {
        keyword: keyword.trim(),
        searchedAt: new Date().toISOString(),
      },
      ...filteredSearches,
    ].slice(0, MAX_RECENT_SEARCHES); // 최대 4개까지만 유지

    // 쿠키에 저장
    Cookies.set(RECENT_SEARCH_COOKIE_KEY, JSON.stringify(newSearches), {
      expires: COOKIE_EXPIRES_DAYS,
    });
  } catch (error) {
    console.error('Failed to add recent search:', error);
  }
};

/**
 * 특정 검색어를 최근 검색어 목록에서 삭제합니다
 * @param keyword - 삭제할 검색어
 */
export const removeRecentSearch = (keyword: string): void => {
  try {
    const searches = getRecentSearches();
    const filteredSearches = searches.filter(
      (search) => search.keyword !== keyword
    );

    if (filteredSearches.length === 0) {
      // 빈 배열이면 쿠키 삭제
      Cookies.remove(RECENT_SEARCH_COOKIE_KEY);
    } else {
      // 업데이트된 목록 저장
      Cookies.set(RECENT_SEARCH_COOKIE_KEY, JSON.stringify(filteredSearches), {
        expires: COOKIE_EXPIRES_DAYS,
      });
    }
  } catch (error) {
    console.error('Failed to remove recent search:', error);
  }
};

/**
 * 모든 최근 검색어를 삭제합니다
 */
export const clearRecentSearches = (): void => {
  try {
    Cookies.remove(RECENT_SEARCH_COOKIE_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
};
