import type { Metadata } from "next";
import { PAGES } from "@/shared/constants/routes";
import CompanyCreateView from "@/views/admin/company/CompanyCreateView";

export const metadata: Metadata = PAGES.ADMIN.COMPANY.CREATE.metadata;

/**
 * 관리자 판매자 등록 페이지
 */
export default function AdminCompanyCreatePage() {
  return <CompanyCreateView />;
}
