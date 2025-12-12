import type { Metadata } from "next";
import { Suspense } from "react";
import { MainBanner, PerformanceCategory } from "@/features/home";
import PerformanceListServer from "@/features/home/ui/PerformanceListServer";
import { PAGES } from "@/shared/constants/routes";

/**
 * 공연 리스트 스켈레톤 (Suspense fallback)
 */
function PerformanceListFallback() {
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
 * 홈페이지 메타데이터
 */
export const metadata: Metadata = PAGES.HOME.metadata;

/**
 * 홈페이지 뷰 컴포넌트
 */
export default async function HomePage() {
  return (
    <div className="">
      <h1 className="my-10 text-2xl font-bold text-center">NOL 티켓</h1>

      <section className="my-4 sm:my-10">
        <PerformanceCategory />
      </section>

      <section className="my-4 sm:my-20">
        <Suspense
          fallback={
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          }
        >
          <MainBanner />
        </Suspense>
      </section>

      <section className="my-4 sm:my-20">
        <h2 className="mb-6 text-xl font-bold text-center">추천 공연</h2>
        <Suspense fallback={<PerformanceListFallback />}>
          <PerformanceListServer />
        </Suspense>
      </section>
    </div>
  );
}
