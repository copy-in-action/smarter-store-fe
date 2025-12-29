import type { Metadata } from "next";
import { Suspense } from "react";
import {
  MainBanner,
  PerformanceCategory,
  PerformanceListServer,
} from "@/features/service/home";
import { PerformanceListSkeleton } from "@/features/service/home/ui/PerformanceListSkeleton";
import { PAGES } from "@/shared/constants/routes";

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
      <h1 className="my-10 text-2xl font-bold text-center">CIA 티켓</h1>

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
        <Suspense fallback={<PerformanceListSkeleton />}>
          <PerformanceListServer />
        </Suspense>
      </section>
    </div>
  );
}
