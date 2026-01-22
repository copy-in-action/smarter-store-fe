import type { Metadata } from "next";
import { PAGES } from "@/shared/config/routes";
import CompanyEditView from "@/views/admin/company/CompanyEditView";

export const metadata: Metadata = PAGES.ADMIN.COMPANY.EDIT.metadata;

/**
 * 관리자 판매자 수정 페이지 속성
 */
interface AdminCompanyEditPageProps {
  /** URL 파라미터 */
  params: {
    /** 판매자 ID */
    id: string;
  };
}

/**
 * 관리자 판매자 수정 페이지
 */
export default async function AdminCompanyEditPage({
  params,
}: AdminCompanyEditPageProps) {
  const { id } = await params;

  const companyId = Number(id);

  // ID가 숫자가 아닌 경우 에러 처리
  if (isNaN(companyId)) {
    return (
      <div className="container py-8 mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-destructive">
            잘못된 접근
          </h1>
          <p className="text-muted-foreground">
            올바르지 않은 판매자 ID입니다.
          </p>
        </div>
      </div>
    );
  }

  return <CompanyEditView companyId={companyId} />;
}
