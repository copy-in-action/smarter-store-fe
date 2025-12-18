"use client";

import {
  ArrowLeft,
  Building2,
  Edit,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteCompany, useGetCompany } from "@/entities/company";
import { PAGES } from "@/shared/constants/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

/**
 * 기획사 상세 컴포넌트 속성
 */
interface CompanyDetailProps {
  /** 기획사 ID */
  companyId: number;
}

/**
 * 기획사/판매자 상세 및 수정 컴포넌트
 */
export function CompanyDetail({ companyId }: CompanyDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: company, isLoading, error } = useGetCompany(companyId);
  const deleteCompanyMutation = useDeleteCompany();

  /**
   * 수정 페이지로 이동
   */
  const handleEditRedirect = () => {
    router.push(PAGES.ADMIN.COMPANY.EDIT.path(companyId));
  };

  /**
   * 기획사 삭제 핸들러
   */
  const handleDelete = async () => {
    try {
      await deleteCompanyMutation.mutateAsync(companyId);
      toast.success("기획사가 성공적으로 삭제되었습니다.");
      router.push(PAGES.ADMIN.COMPANY.LIST.path);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "기획사 삭제에 실패했습니다.";
      toast.error(message);
    }
  };

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.push(PAGES.ADMIN.COMPANY.LIST.path);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">기획사 정보를 불러오는 중...</span>
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
                {error?.message || "기획사 정보를 찾을 수 없습니다."}
              </p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 상세보기 모드
  return (
    <div className="container py-8 mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {company.name}
            </h1>
            <p className="text-muted-foreground">기획사/판매자 상세 정보</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <Button onClick={handleEditRedirect} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <CardTitle>기본 정보</CardTitle>
            </div>
            <Badge variant="secondary">ID: #{company.id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                상호
              </div>
              <div className="text-base">{company.name}</div>
            </div>

            {company.ceoName && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <User className="w-4 h-4" />
                  대표자명
                </div>
                <div className="text-base">{company.ceoName}</div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                사업자등록번호
              </div>
              <div className="font-mono text-base">
                {company.businessNumber}
              </div>
            </div>

            {company.email && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  이메일
                </div>
                <div className="text-base">{company.email}</div>
              </div>
            )}

            {company.contact && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  연락처
                </div>
                <div className="text-base">{company.contact}</div>
              </div>
            )}

            {company.performanceInquiry && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  공연 문의
                </div>
                <div className="text-base">{company.performanceInquiry}</div>
              </div>
            )}
          </div>

          {company.address && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  주소
                </div>
                <div className="text-base">{company.address}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기획사 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{company.name}</strong>을(를) 정말 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
