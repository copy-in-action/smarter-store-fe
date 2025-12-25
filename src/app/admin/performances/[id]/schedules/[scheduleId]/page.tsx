import { PAGES } from "@/shared/constants/routes";
import { PerformanceScheduleDetailView } from "@/views/admin/performance-schedule-detail";

/**
 * 공연 회차 상세 페이지 속성
 */
interface PerformanceScheduleDetailPageProps {
  /** 경로 매개변수 */
  params: Promise<{
    /** 공연 ID */
    id: string;
    /** 회차 ID */
    scheduleId: string;
  }>;
}

/**
 * 메타데이터 설정
 */
export const metadata = PAGES.ADMIN.PERFORMANCES.SCHEDULE_DETAIL.metadata;

/**
 * 공연 회차 상세 페이지 컴포넌트
 * @param params - 경로 매개변수
 */
export default async function PerformanceScheduleDetailPage({
  params,
}: PerformanceScheduleDetailPageProps) {
  const { id, scheduleId } = await params;
  const performanceId = Number(id);
  const performanceScheduleId = Number(scheduleId);

  return (
    <PerformanceScheduleDetailView
      performanceId={performanceId}
      scheduleId={performanceScheduleId}
    />
  );
}