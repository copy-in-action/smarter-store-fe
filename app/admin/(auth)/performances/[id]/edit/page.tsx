import { Suspense } from "react";
import { PerformanceEditView } from "@/views/admin/performances/PerformanceEditView";

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

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PerformanceEditView performanceId={performanceId} />
    </Suspense>
  );
}
