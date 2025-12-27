import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PerformanceList } from "./PerformanceListClient";

/**
 * 서버 컴포넌트 - 공연 리스트 데이터 fetch 및 hydration
 * Suspense boundary와 함께 사용하여 스트리밍 렌더링 지원
 */
export default async function PerformanceListServer() {
  const performances = await getPerformancesForServer();
  return <PerformanceList initialData={performances} />;
}
