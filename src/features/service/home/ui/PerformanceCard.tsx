import Image from "next/image";
import Link from "next/link";
import type { HomePerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";

/**
 * 공연 카드 props
 */
export interface PerformanceCardProps {
  /** 공연 데이터 */
  performance: HomePerformanceResponse;
}

/**
 * 개별 공연 카드 컴포넌트
 * 홈 화면의 공연 리스트에서 사용되는 공통 카드 컴포넌트
 */
export function PerformanceCard({ performance }: PerformanceCardProps) {
  return (
    <Link
      href={PAGES.PERFORMANCE.DETAIL.path(performance.id)}
      className="block cursor-pointer group"
    >
      <div className="space-y-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-90 transition-opacity">
          <Image
            src={performance?.mainImageUrl || ""}
            alt={performance.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        </div>
        <div className="w-full px-1 space-y-1">
          <div
            className="text-base sm:text-lg transition-colors group-hover:text-gray-600 mb-0.5 line-clamp-1"
            title={performance.title}
          >
            {performance.title}
          </div>
          <p className="text-sm text-gray-500 sm:text-base">
            {performance.venueName || "장소 미정"}
          </p>
        </div>
      </div>
    </Link>
  );
}
