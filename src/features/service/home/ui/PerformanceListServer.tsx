import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PerformanceListClient } from "./PerformanceListClient";

/**
 * 서버 컴포넌트 - 공연 리스트 데이터 fetch
 */
export default async function PerformanceListServer() {
  // 서버에서 직접 데이터 fetch
  const performances = await getPerformancesForServer();

  return <PerformanceListClient initialData={performances} />;
}
