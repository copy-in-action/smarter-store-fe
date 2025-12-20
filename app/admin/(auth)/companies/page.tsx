import type { Metadata } from "next";
import { PAGES } from "@/shared/constants/routes";
import CompanyListView from "@/views/admin/company/CompanyListView";

export const metadata: Metadata = PAGES.ADMIN.COMPANY.LIST.metadata;

/**
 * 관리자 판매자 목록 페이지
 */
export default function AdminCompaniesPage() {
  return <CompanyListView />;
}
