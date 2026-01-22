import { PerformanceEditView } from "@/views/admin/performance-management";

/**
 * 공연 수정 페이지 속성
 */
interface PerformanceEditPageProps {
  /** 라우트 매개변수 */
  params: {
    /** 공연 ID */
    id: string;
  };
}

/**
 * 공연 수정 페이지
 */
export default async function PerformanceEditPage({
  params,
}: PerformanceEditPageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id, 10);

  return <PerformanceEditView performanceId={performanceId} />;
}
