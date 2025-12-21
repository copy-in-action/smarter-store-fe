"use client";

import Image from "next/image";
import Link from "next/link";
import { usePerformances } from "@/entities/performance/api/performance.api";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { CarouselItem } from "@/shared/ui/carousel";
import { ReusableCarousel } from "@/shared/ui/reusable-carousel";

import { PerformanceListSkeleton } from "./PerformanceListSkeleton";

/**
 * 클라이언트 컴포넌트 props
 */
interface PerformanceListClientProps {
  /** 서버에서 전달받은 초기 데이터 */
  initialData: PerformanceResponse[];
}

/**
 * 공연 리스트 에러 컴포넌트
 */
function PerformanceListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 wrapper sm:px-10">
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="mb-2 text-red-500">
            공연 정보를 불러오는데 실패했습니다.
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-blue-500 underline hover:text-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 공연 리스트 뷰 컴포넌트
 */
function PerformanceListView({
  performances,
}: {
  performances: PerformanceResponse[];
}) {
  if (!performances || performances.length === 0) {
    return (
      <div className="px-4 wrapper sm:px-10">
        <div className="flex items-center justify-center py-10">
          <div className="text-gray-500">등록된 공연이 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 wrapper sm:px-10">
      <ReusableCarousel
        options={{
          autoplay: false,
          showNavigation: true,
          showPageControls: false,
          loop: false,
          slidesToScroll: 4,
          align: "start",
          breakpoints: {
            "(min-width: 640px)": { slidesToScroll: 1 },
          },
        }}
        navigationButtonClassName="-translate-y-[60px]"
        contentClassName="grid grid-cols-2 gap-2 sm:flex sm:-ml-2 sm:gap-0"
      >
        {performances.map((performance, index) => (
          <CarouselItem
            key={performance.id}
            className={`${
              index < 4 ? "block" : "hidden"
            } sm:block sm:pl-2 lg:pl-4 basis-auto sm:basis-4/12 lg:basis-3/13`}
          >
            <Link
              href={`/performance/${performance.id}`}
              className="block cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-90 transition-opacity">
                  <Image
                    src={performance.mainImageUrl || "/images/placeholder.jpg"}
                    alt={performance.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <div className="w-full px-1 space-y-1">
                  <div
                    className="text-lg transition-colors group-hover:text-gray-600 mb-0.5 line-clamp-1"
                    title={performance.title}
                  >
                    {performance.title}
                  </div>
                  <p className="text-gray-500">
                    {performance.venue?.name || "장소 미정"}
                  </p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </ReusableCarousel>
    </div>
  );
}

/**
 * 클라이언트 컴포넌트 - React Query와 연동
 */
export function PerformanceListClient({
  initialData,
}: PerformanceListClientProps) {
  // React Query에 initialData로 서버 데이터 전달
  const {
    data: performances = initialData,
    isLoading,
    error,
    refetch,
  } = usePerformances({
    initialData,
    // 서버 데이터가 있으면 stale time을 길게 설정
    staleTime: initialData.length > 0 ? 1000 * 60 * 5 : 0, // 5분
  });

  if (isLoading) {
    return <PerformanceListSkeleton />;
  }

  if (error) {
    return <PerformanceListError onRetry={() => refetch()} />;
  }

  return <PerformanceListView performances={performances} />;
}
