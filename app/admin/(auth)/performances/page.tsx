import type { Metadata } from "next";
import { PAGES } from "@/shared/config/routes";
import PerformanceListView from "@/views/admin/performance-management/PerformanceListView";

/**
 * 관리자 공연 목록 페이지 메타데이터
 */
export const metadata: Metadata = PAGES.ADMIN.PERFORMANCES.LIST.metadata;

/**
 * 관리자 공연 목록 페이지
 */
export default function PerformanceListPage() {
  return <PerformanceListView />;
}
