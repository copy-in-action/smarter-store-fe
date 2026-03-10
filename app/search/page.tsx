import { Suspense } from 'react';
import { SearchResultsPage } from '@/views/service/search-results';

/**
 * 검색 결과 페이지
 * - Route: /search?q={keyword}
 * - 쿼리 파라미터: q, status[], category[], region[], sort
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <SearchResultsPage />
    </Suspense>
  );
}
