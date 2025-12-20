"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type CompanyRequest,
  useGetCompany,
  useUpdateCompany,
} from "@/entities/company";
import { PAGES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { CompanyForm } from "./CompanyForm";

/**
 * 판매자 수정 컴포넌트 속성
 */
interface CompanyEditProps {
  /** 판매자 ID */
  companyId: number;
}

/**
 * 판매자 수정 컴포넌트
 */
export function CompanyEdit({ companyId }: CompanyEditProps) {
  const router = useRouter();
  const { data: company, isLoading, error } = useGetCompany(companyId);
  const updateCompanyMutation = useUpdateCompany();

  /**
   * 판매자 수정 핸들러
   * @param data - 수정할 판매자 데이터
   */
  const handleSubmit = async (data: CompanyRequest) => {
    try {
      await updateCompanyMutation.mutateAsync({ id: companyId, data });
      toast.success("판매자 정보가 성공적으로 수정되었습니다.");
      // 수정 성공 후 상세 페이지로 이동
      router.push(PAGES.ADMIN.COMPANY.DETAIL.path(companyId));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "판매자 정보 수정에 실패했습니다.";
      toast.error(message);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    router.push(PAGES.ADMIN.COMPANY.DETAIL.path(companyId));
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">판매자 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !company) {
    return (
      <div className="container py-8 mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4 text-destructive">
                {error?.message || "판매자 정보를 찾을 수 없습니다."}
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <CompanyForm
        mode="edit"
        initialData={company}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateCompanyMutation.isPending}
      />
    </div>
  );
}
