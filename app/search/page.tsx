import type { Metadata } from "next";
import { Suspense } from "react";
import { PAGES } from "@/shared/config";
import { SearchResultsPage } from "@/views/service/search-results";

/**
 * 검색 결과 페이지 속성
 */
interface PageProps {
  /** URL 쿼리 파라미터 (q, status[], category[], region[], sort) */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * 검색 결과 페이지 메타데이터 생성 (SEO)
 *
 * canonical은 `routes.ts`에서 파라미터 없는 `/search`로 고정된다.
 * 필터·정렬 조합마다 생성되는 URL이 각각 색인되면 중복 콘텐츠가 되기 때문이다.
 *
 * @param props - 페이지 속성
 * @returns Next.js `Metadata` 객체
 */
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const keyword = typeof q === "string" && q.trim() ? q.trim() : undefined;

  return PAGES.SEARCH.metadata(keyword);
}

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
