import { CompanyDetail } from "@/features/admin/company-management";

/**
 * 관리자 판매자 상세 페이지 뷰 속성
 */
interface CompanyDetailViewProps {
  /** 판매자 ID */
  companyId: number;
}

/**
 * 관리자 판매자 상세 페이지 뷰
 */
export default function CompanyDetailView({
  companyId,
}: CompanyDetailViewProps) {
  return <CompanyDetail companyId={companyId} />;
}
