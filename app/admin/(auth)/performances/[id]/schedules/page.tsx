import { notFound } from "next/navigation";
import { getPerformanceDetailForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES } from "@/shared/constants";
import { PerformanceScheduleListView } from "@/views/admin/performance-schedule-management";

/**
 * 공연 회차 목록 페이지 속성
 */
interface PerformanceScheduleListPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 공연 회차 목록 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.PERFORMANCES.SCHEDULE_LIST.metadata;

/**
 * 관리자 공연 회차 목록 페이지
 */
export default async function PerformanceScheduleListPage({
  params,
}: PerformanceScheduleListPageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id);

  if (Number.isNaN(performanceId)) {
    notFound();
  }

  try {
    // 공연 정보 조회
    const performance = await getPerformanceDetailForServer(performanceId);

    return (
      <PerformanceScheduleListView
        performanceId={performanceId}
        performanceTitle={performance.title}
      />
    );
  } catch (error) {
    console.error("공연 정보 조회 실패:", error);
    notFound();
  }
}
