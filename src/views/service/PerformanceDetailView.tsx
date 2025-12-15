/**
 * 서비스 페이지 공연 상세 뷰 (SSR)
 */

import { notFound } from "next/navigation";
import { ServicePerformanceDetail } from "@/features/service/performance-detail";
import { getPerformanceDetailForServer } from "@/features/service/performance-detail/api/performanceDetail.api";

/**
 * 공연 상세 페이지 속성
 */
interface PerformanceDetailViewProps {
  /** 공연 ID */
  performanceId: number;
}

/**
 * 서비스 페이지 공연 상세 뷰 컴포넌트
 * @param performanceId - 공연 ID
 */
export default async function PerformanceDetailView({
  performanceId,
}: PerformanceDetailViewProps) {
  try {
    // 서버에서 공연 데이터 조회
    const performance = await getPerformanceDetailForServer(performanceId);

    // visible이 false인 경우 404 처리
    if (!performance.visible) {
      notFound();
    }

    return (
      <main className="min-h-screen">
        <ServicePerformanceDetail performance={performance} />
      </main>
    );
  } catch (error) {
    console.error("공연 상세 조회 실패:", error);
    notFound();
  }
}
