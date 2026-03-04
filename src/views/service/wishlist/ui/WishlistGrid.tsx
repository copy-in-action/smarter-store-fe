/**
 * 찜 목록 그리드 컴포넌트
 * 무한 스크롤로 찜한 공연 목록을 표시합니다
 */

"use client";

import type { InfiniteData } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { WishlistResponse } from "@/entities/wishlist";
import type { PagedWishlistResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * WishlistGrid Props
 */
interface WishlistGridProps {
  /** 무한 스크롤 데이터 */
  data: InfiniteData<PagedWishlistResponse> | undefined;
  /** 다음 페이지 가져오기 함수 */
  fetchNextPage: () => void;
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
  /** 다음 페이지 로딩 중 여부 */
  isFetchingNextPage: boolean;
}

/**
 * 찜 목록 그리드
 * 무한 스크롤을 통해 찜한 공연 목록을 표시합니다
 */
export function WishlistGrid({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: WishlistGridProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  /**
   * Intersection Observer를 통한 무한 스크롤 구현
   * 마지막 요소가 화면에 보이면 다음 페이지 로드
   */
  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * 모든 페이지의 찜 목록 데이터 병합
   */
  const allWishlists = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <div className="mt-4 space-y-4">
      {/* 찜 목록 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:gap-2 md:grid-cols-2 xl:grid-cols-3">
        {allWishlists.map((wishlist) => (
          <WishlistCard key={wishlist.performanceId} wishlist={wishlist} />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      {hasNextPage && (
        <div ref={observerRef} className="py-4">
          <div className="grid grid-cols-1 gap-4 sm:gap-2 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <WishlistCardSkeleton key={i.toString()} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 개별 찜 카드 컴포넌트 Props
 */
interface WishlistCardProps {
  /** 찜 데이터 */
  wishlist: WishlistResponse;
}

/**
 * 개별 찜 카드 컴포넌트
 * 찜한 공연의 포스터와 정보를 표시합니다
 */
function WishlistCard({ wishlist }: WishlistCardProps) {
  return (
    <Link
      href={PAGES.PERFORMANCE.DETAIL.path(wishlist.performanceId)}
      className="block cursor-pointer group"
    >
      <div className="flex gap-2 space-y-3">
        {/* 공연 포스터 */}
        <div
          className="relative max-h-44 max-w-32 md:max-h-64 md:max-w-48 xl:max-h-[initial] xl:max-w-[initial] aspect-[3/4] 
        overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-90 transition-opacity flex-2"
        >
          <Image
            src={wishlist.mainImageUrl || ""}
            alt={wishlist.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        </div>

        {/* 공연 정보 */}
        <div className="px-1 space-y-2 flex-3">
          <div
            className="text-base sm:text-lg transition-colors group-hover:text-gray-600 mb-0.5 font-semibold tracking-tighter"
            title={wishlist.title}
          >
            {wishlist.title}
          </div>
          <p className="text-sm text-gray-500 sm:text-base">
            {wishlist.location || "장소 미정"}
          </p>
          {wishlist.priceInfo && wishlist.priceInfo !== "0원~" && (
            <p className="text-sm font-medium text-gray-600">
              {wishlist.priceInfo}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * 찜 카드 스켈레톤 컴포넌트
 * 로딩 중일 때 표시되는 스켈레톤 UI
 */
function WishlistCardSkeleton() {
  return (
    <div className="flex gap-2 space-y-3">
      {/* 공연 포스터 스켈레톤 */}
      <Skeleton className="relative max-h-44 max-w-32 md:max-h-64 md:max-w-48 xl:max-h-[initial] xl:max-w-[initial] aspect-[3/4] rounded-lg flex-2" />

      {/* 공연 정보 스켈레톤 */}
      <div className="px-1 space-y-2 flex-3">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
}
