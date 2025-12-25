"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeletePerformance,
  usePerformances,
} from "@/features/admin/performance-management";
import type { PerformanceResponse } from "@/shared/api/orval/types";
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
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PerformanceTable } from "@/widgets/performance-table";

/**
 * 관리자 공연 목록 페이지 뷰 컴포넌트
 */
export default function PerformanceListView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PerformanceResponse | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  // TanStack Query로 공연 목록 조회
  const { data: performances = [], isLoading, error } = usePerformances();

  // 공연 삭제 뮤테이션
  const deletePerformanceMutation = useDeletePerformance();

  /**
   * 검색어에 따른 공연 필터링
   */
  const filteredPerformances = performances.filter(
    (performance: PerformanceResponse) => {
      const query = searchQuery.toLowerCase();
      return (
        performance.title.toLowerCase().includes(query) ||
        performance.category.toLowerCase().includes(query) ||
        performance.venue?.name?.toLowerCase().includes(query) ||
        performance.id.toString().includes(query)
      );
    },
  );

  /**
   * 공연 생성 페이지로 이동
   */
  const handleCreatePerformance = () => {
    router.push(PAGES.ADMIN.PERFORMANCES.CREATE.path);
  };

  /**
   * 공연 상세보기 핸들러
   * @param performance - 선택된 공연 데이터
   */
  const handleViewPerformance = (performance: PerformanceResponse) => {
    router.push(PAGES.ADMIN.PERFORMANCES.DETAIL.path(performance.id));
  };

  /**
   * 공연 수정 핸들러
   * @param performance - 수정할 공연 데이터
   */
  const handleEditPerformance = (performance: PerformanceResponse) => {
    router.push(PAGES.ADMIN.PERFORMANCES.EDIT.path(performance.id));
  };

  /**
   * 공연 삭제 버튼 클릭 핸들러
   * @param performance - 삭제할 공연 데이터
   */
  const handleDeletePerformance = (performance: PerformanceResponse) => {
    setDeleteTarget(performance);
    setIsDeleteDialogOpen(true);
  };

  /**
   * 공연 삭제 확인 핸들러
   */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deletePerformanceMutation.mutateAsync(deleteTarget.id);

      toast.success(`${deleteTarget.title} 공연이 성공적으로 삭제되었습니다.`);

      // 다이얼로그 닫기
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error("공연 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  /**
   * 삭제 다이얼로그 닫기 핸들러
   */
  const handleCloseDeleteDialog = () => {
    if (!deletePerformanceMutation.isPending) {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              공연 목록을 불러오는 중 오류가 발생했습니다: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공연 관리</h1>
          <p className="text-muted-foreground">
            등록된 공연을 관리하고 새로운 공연을 추가할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleCreatePerformance} className="gap-2">
          <Plus className="h-4 w-4" />
          공연 추가
        </Button>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">공연 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="공연명, 카테고리, 공연장, ID로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                size="sm"
              >
                초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 공연 목록 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              공연 목록
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredPerformances.length}개)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceTable
            performances={filteredPerformances}
            isLoading={isLoading}
            onView={handleViewPerformance}
            onEdit={handleEditPerformance}
            onDelete={handleDeletePerformance}
          />
        </CardContent>
      </Card>

      {/* 공연 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공연 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 <strong>{deleteTarget?.title}</strong> 공연을
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCloseDeleteDialog}
              disabled={deletePerformanceMutation.isPending}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletePerformanceMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePerformanceMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
