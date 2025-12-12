"use client";

import Image from "next/image";
import Link from "next/link";
import { usePerformances } from "@/entities/performance/api/performance.api";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/ui/carousel";

/**
 * 클라이언트 컴포넌트 props
 */
interface PerformanceListClientProps {
  /** 서버에서 전달받은 초기 데이터 */
  initialData: PerformanceResponse[];
}

/**
 * 공연 리스트 로딩 스켈레톤
 */
function PerformanceListSkeleton() {
  return (
    <div className="px-4 wrapper sm:px-10">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i.toString()}
            className="space-y-3 basis-2/5 sm:basis-3/10 lg:basis-3/13"
          >
            <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
          breakpoints: {
            "(min-width: 640px)": { slidesToScroll: 2 },
          },
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {performances.map((performance) => (
            <CarouselItem
              key={performance.id}
              className="pl-2 sm:pl-4 basis-2/5 sm:basis-3/10 lg:basis-3/13"
            >
              <Link
                href={`/performance/${performance.id}`}
                className="block cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-90 transition-opacity">
                    <Image
                      src={
                        performance.mainImageUrl || "/images/placeholder.jpg"
                      }
                      alt={performance.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium transition-colors line-clamp-2 group-hover:text-gray-600">
                      {performance.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {performance.venue?.name || "장소 미정"}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
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
