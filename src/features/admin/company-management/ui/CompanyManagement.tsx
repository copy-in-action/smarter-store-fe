"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type Company,
  useDeleteCompany,
  useGetAllCompanies,
} from "@/entities/company";
import { PAGES } from "@/shared/config/routes";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { createCompanyColumns } from "./CompanyColumns";
import { CompanyDataTable } from "./CompanyDataTable";

/**
 * 판매자 관리 컴포넌트
 */
export function CompanyManagement() {
  const router = useRouter();
  const {
    data: companies = [],
    isLoading,
    error,
    isError,
  } = useGetAllCompanies();
  const deleteCompanyMutation = useDeleteCompany();

  /**
   * 판매자 상세보기 핸들러
   * @param company - 선택된 판매자
   */
  const handleViewCompany = (company: Company) => {
    router.push(PAGES.ADMIN.COMPANY.DETAIL.path(company.id));
  };

  /**
   * 판매자 수정 핸들러
   * @param company - 수정할 판매자
   */
  const handleEditCompany = (company: Company) => {
    router.push(PAGES.ADMIN.COMPANY.EDIT.path(company.id));
  };

  /**
   * 판매자 삭제 핸들러
   * @param company - 삭제할 판매자
   */
  const handleDeleteCompany = async (company: Company) => {
    if (confirm(`'${company.name}'을(를) 정말 삭제하시겠습니까?`)) {
      try {
        await deleteCompanyMutation.mutateAsync(company.id);
        toast.success("판매자가 성공적으로 삭제되었습니다.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "판매자 삭제에 실패했습니다.";
        toast.error(message);
      }
    }
  };

  /**
   * 새 판매자 추가 핸들러
   */
  const handleAddCompany = () => {
    router.push(PAGES.ADMIN.COMPANY.CREATE.path);
  };

  // 통계 계산
  /*   const stats = {
    total: companies.length,
    withEmail: companies.filter((c) => c.email).length,
    withContact: companies.filter((c) => c.contact).length,
    withAddress: companies.filter((c) => c.address).length,
  }; */

  // 컬럼 생성
  const columns = createCompanyColumns({
    onView: handleViewCompany,
    onEdit: handleEditCompany,
    onDelete: handleDeleteCompany,
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">판매자 관리</h1>
          <p className="text-muted-foreground">
            등록된 판매자와 판매자 정보를 관리합니다.
          </p>
        </div>
        <Button onClick={handleAddCompany} className="gap-2">
          <Plus className="w-4 h-4" />새 판매자 추가
        </Button>
      </div>

      {/* 에러 표시 */}
      {isError && (
        <div>
          {error?.message || "데이터를 불러오는 중 오류가 발생했습니다."}
        </div>
      )}

      {/* 통계 카드 */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">전체 판매자</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">등록된 판매자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">이메일 보유</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withEmail}</div>
            <p className="text-xs text-muted-foreground">
              이메일 정보가 있는 판매자
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">연락처 보유</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withContact}</div>
            <p className="text-xs text-muted-foreground">
              연락처 정보가 있는 판매자
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">주소 보유</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withAddress}</div>
            <p className="text-xs text-muted-foreground">
              주소 정보가 있는 판매자
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>판매자 목록</CardTitle>
          <CardDescription>
            등록된 모든 판매자와 판매자의 상세 정보를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyDataTable
            columns={columns}
            data={companies}
            searchKey="name"
            searchPlaceholder="상호, 대표자명, 사업자번호로 검색..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
