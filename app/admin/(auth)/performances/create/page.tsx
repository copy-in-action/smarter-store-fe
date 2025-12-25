import type { Metadata } from "next";
import { PAGES } from "@/shared/constants/routes";
import PerformanceCreateView from "@/views/admin/performance-management/PerformanceCreateView";

/**
 * 관리자 공연 생성 페이지 메타데이터
 */
export const metadata: Metadata = PAGES.ADMIN.PERFORMANCES.CREATE.metadata;

/**
 * 관리자 공연 생성 페이지
 */
export default function PerformanceCreatePage() {
  return <PerformanceCreateView />;
}
