/**
 * Performance Search Feature Public API
 * - 공연 검색 자동완성 기능
 */

// UI 컴포넌트
export { SearchAutocomplete } from './ui/SearchAutocomplete';

// API Hooks
export {
  useAutocompleteQuery,
  useSearchQuery,
  useSearchInfiniteQuery,
} from './api/search.queries';

// 최근 검색 관리 함수
export {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from './model/recent-search';

// 타입
export type { RecentSearch } from './model/search.types';
