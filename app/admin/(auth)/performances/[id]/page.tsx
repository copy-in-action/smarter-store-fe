import { PerformanceDetailView } from "@/views/admin/performance-management";

/**
 * 공연 상세 페이지 속성
 */
interface PerformanceDetailPageProps {
  /** 라우트 매개변수 */
  params: {
    /** 공연 ID */
    id: string;
  };
}

/**
 * 공연 상세 페이지
 */
export default async function PerformanceDetailPage({
  params,
}: PerformanceDetailPageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id, 10);

  return <PerformanceDetailView performanceId={performanceId} />;
}
