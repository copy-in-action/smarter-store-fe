/**
 * 찜 목록 페이지 메인 컴포넌트
 */

"use client";

import { useAuth } from "@/entities/user/model/user-context";
import { useWishlistInfiniteQuery } from "@/entities/wishlist";
import { Skeleton } from "@/shared/ui/skeleton";
import { WishlistEmptyState } from "./WishlistEmptyState";
import { WishlistGrid } from "./WishlistGrid";

/**
 * 찜 목록 페이지
 * 로그인한 사용자의 찜 목록을 보여줍니다
 */
export function WishlistPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isWishlistLoading,
  } = useWishlistInfiniteQuery({
    size: 4,
  });

  /**
   * 로딩 상태 - 인증 확인 중
   */
  if (isAuthLoading || (!user && isWishlistLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i.toString()} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <div className="w-full px-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * 첫 페이지 데이터로 찜 목록 존재 여부 확인
   */
  const firstPageData = data?.pages[0]?.data;
  const hasWishlists = firstPageData && firstPageData.length > 0;

  return (
    <div className="wrapper mt-4">
      {/* 페이지 제목 */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        찜한 공연
      </h1>

      {/* 찜 목록이 없는 경우 빈 상태 표시 */}
      {!hasWishlists && !isWishlistLoading && <WishlistEmptyState />}

      {/* 찜 목록이 있는 경우 그리드 표시 */}
      {hasWishlists && (
        <WishlistGrid
          data={data}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </div>
  );
}
