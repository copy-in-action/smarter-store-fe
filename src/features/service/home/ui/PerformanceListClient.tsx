"use client";

import Image from "next/image";
import Link from "next/link";
import { usePerformances } from "@/entities/performance";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { CarouselItem } from "@/shared/ui/carousel";
import { ReusableCarousel } from "@/shared/ui/reusable-carousel";
import { PerformanceListSkeleton } from "./PerformanceListSkeleton";

/**
 * 공연 리스트 props
 */
interface PerformanceListProps {
  /** 서버에서 전달받은 초기 데이터 */
  initialData: PerformanceResponse[];
}

/**
 * 배열을 지정된 크기로 그룹화하는 헬퍼 함수
 * @param arr - 그룹화할 배열
 * @param size - 그룹 크기
 * @returns 그룹화된 배열
 */
function groupItemsBySize<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

/**
 * 공연 리스트 에러 상태
 */
function PerformanceListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 wrapper sm:px-10!">
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
 * 공연 리스트 빈 상태
 */
function PerformanceListEmpty() {
  return (
    <div className="px-4 wrapper sm:px-10!">
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-500">등록된 공연이 없습니다.</div>
      </div>
    </div>
  );
}

/**
 * 개별 공연 카드 컴포넌트
 */
function PerformanceCard({
  performance,
}: {
  performance: PerformanceResponse;
}) {
  return (
    <Link
      href={PAGES.PERFORMANCE.DETAIL.path(performance.id)}
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
  );
}

/**
 * 공연 리스트 컴포넌트 (Server + Client 통합)
 */
export function PerformanceList({ initialData }: PerformanceListProps) {
  const {
    data: performances = initialData,
    isLoading,
    error,
    refetch,
  } = usePerformances({
    initialData,
    staleTime: initialData.length > 0 ? 1000 * 60 * 5 : 0,
  });

  if (isLoading) {
    return <PerformanceListSkeleton />;
  }

  if (error) {
    return <PerformanceListError onRetry={() => refetch()} />;
  }

  if (!performances || performances.length === 0) {
    return <PerformanceListEmpty />;
  }

  /**
   * 모바일에서는 4개씩 그룹화하여 2x2 형태로 표시
   * 데스크톱에서는 가로 스크롤 방식 사용
   */

  const performanceGroups = groupItemsBySize(performances, 4);

  return (
    <>
      <div className="px-4 wrapper sm:hidden">
        <ReusableCarousel
          options={{
            autoplay: false,
            showNavigation: true,
            showPageControls: false,
            loop: false,
            slidesToScroll: 1,
            align: "start",
          }}
          navigationButtonClassName="-translate-y-[60px]"
          contentClassName="flex -ml-4"
        >
          {performanceGroups.map((group) => (
            <CarouselItem key={group[0].id} className="pl-4 basis-full">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {group.map((performance) => (
                  <PerformanceCard
                    key={performance.id}
                    performance={performance}
                  />
                ))}
              </div>
            </CarouselItem>
          ))}
        </ReusableCarousel>
      </div>

      <div className="px-4 wrapper sm:px-10! hidden sm:block">
        <ReusableCarousel
          options={{
            autoplay: false,
            showNavigation: true,
            showPageControls: false,
            loop: false,
            slidesToScroll: 1,
            align: "start",
          }}
          navigationButtonClassName="-translate-y-[60px]"
          contentClassName="flex -ml-2 gap-0"
        >
          {performances.map((performance) => (
            <CarouselItem
              key={performance.id}
              className="pl-2 lg:pl-4 basis-4/12 lg:basis-3/13"
            >
              <PerformanceCard performance={performance} />
            </CarouselItem>
          ))}
        </ReusableCarousel>
      </div>
    </>
  );
}
