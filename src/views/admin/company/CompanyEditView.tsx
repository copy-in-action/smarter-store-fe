import { CompanyEdit } from '@/features/admin/company-management';

/**
 * 관리자 기획사/판매자 수정 페이지 뷰 속성
 */
interface CompanyEditViewProps {
  /** 기획사 ID */
  companyId: number;
}

/**
 * 관리자 기획사/판매자 수정 페이지 뷰
 */
export default function CompanyEditView({ companyId }: CompanyEditViewProps) {
  return <CompanyEdit companyId={companyId} />;
}