import { notFound } from "next/navigation";
import { PAGES } from "@/shared/constants";
import { PerformanceScheduleDetailView } from "@/views/admin/performance-schedule-detail";

interface PerformanceScheduleDetailPage {
  params: Promise<{
    id: string;
    scheduleId: string;
  }>;
}
export const metadata = PAGES.ADMIN.PERFORMANCES.SCHEDULE_LIST.metadata;

const PerformanceScheduleDetailPage = async ({
  params,
}: PerformanceScheduleDetailPage) => {
  const { id, scheduleId } = await params;
  const performanceId = Number.parseInt(id, 10);
  const _scheduleId = Number.parseInt(scheduleId, 10);

  if (Number.isNaN(performanceId) || Number.isNaN(_scheduleId)) {
    notFound();
  }

  return (
    <PerformanceScheduleDetailView
      performanceId={performanceId}
      scheduleId={_scheduleId}
    />
  );
};

export default PerformanceScheduleDetailPage;
