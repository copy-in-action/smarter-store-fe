"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type CompanyRequest, useCreateCompany } from "@/entities/company";
import { PAGES } from "@/shared/constants/routes";
import { CompanyForm } from "./CompanyForm";

/**
 * 기획사/판매자 등록 컴포넌트
 */
export function CompanyCreate() {
  const router = useRouter();
  const createCompanyMutation = useCreateCompany();

  /**
   * 기획사 등록 핸들러
   * @param data - 기획사 데이터
   */
  const handleSubmit = async (data: CompanyRequest) => {
    try {
      const createdCompany = await createCompanyMutation.mutateAsync(data);
      toast.success("기획사가 성공적으로 등록되었습니다.");
      // 등록 성공 후 상세 페이지로 이동
      router.push(PAGES.ADMIN.COMPANY.DETAIL.path(createdCompany.id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "기획사 등록에 실패했습니다.";
      toast.error(message);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    router.push(PAGES.ADMIN.COMPANY.LIST.path);
  };

  return (
    <div className="container py-8 mx-auto">
      <CompanyForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createCompanyMutation.isPending}
      />
    </div>
  );
}
