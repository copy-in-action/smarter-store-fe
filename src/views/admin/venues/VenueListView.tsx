"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteVenue, useVenues } from "@/entities/venue";
import { VenueDeleteDialog } from "@/features/admin/venue-delete";
import { ApiErrorClass } from "@/shared/api";
import type { VenueResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { VenueListTable } from "@/widgets/venue-list";

/**
 * 관리자 공연장 목록 페이지 뷰 컴포넌트
 */
export default function VenueListView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<VenueResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  // TanStack Query로 공연장 목록 조회
  const { data: venues = [], isLoading, error } = useVenues();

  // 공연장 삭제 뮤테이션
  const deleteVenueMutation = useDeleteVenue();

  /**
   * 검색어에 따른 공연장 필터링
   */
  const filteredVenues = venues.filter((venue: VenueResponse) => {
    const query = searchQuery.toLowerCase();
    return (
      venue.name.toLowerCase().includes(query) ||
      venue.address?.toLowerCase().includes(query) ||
      venue.id.toString().includes(query)
    );
  });

  /**
   * 공연장 생성 페이지로 이동
   */
  const handleCreateVenue = () => {
    router.push(PAGES.ADMIN.VENUES.CREATE.path);
  };

  /**
   * 공연장 상세보기 핸들러
   * @param venue - 선택된 공연장 데이터
   */
  const handleViewVenue = (venue: VenueResponse) => {
    router.push(PAGES.ADMIN.VENUES.DETAIL.path(venue.id));
  };

  /**
   * 공연장 수정 핸들러
   * @param venue - 수정할 공연장 데이터
   */
  const handleEditVenue = (venue: VenueResponse) => {
    router.push(PAGES.ADMIN.VENUES.EDIT.path(venue.id));
  };

  /**
   * 공연장 삭제 버튼 클릭 핸들러
   * @param venue - 삭제할 공연장 데이터
   */
  const handleDeleteVenue = (venue: VenueResponse) => {
    setDeleteTarget(venue);
    setIsDeleteDialogOpen(true);
  };

  /**
   * 공연장 삭제 확인 핸들러
   * @param venue - 삭제할 공연장 데이터
   */
  const handleConfirmDelete = async (venue: VenueResponse) => {
    try {
      await deleteVenueMutation.mutateAsync(venue.id);

      toast.success(`${venue.name} 공연장이 성공적으로 삭제되었습니다.`);

      // 다이얼로그 닫기
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      if (error instanceof ApiErrorClass) toast.error(error.message);
      else
        toast.error("공연장 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  /**
   * 삭제 다이얼로그 닫기 핸들러
   */
  const handleCloseDeleteDialog = () => {
    if (!deleteVenueMutation.isPending) {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공연장 관리</h1>
          <p className="text-muted-foreground">
            등록된 공연장을 관리하고 새로운 공연장을 추가할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleCreateVenue} className="gap-2">
          <Plus className="h-4 w-4" />
          공연장 추가
        </Button>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">공연장 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="공연장명, 주소, ID로 검색..."
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

      {/* 공연장 목록 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              공연장 목록
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredVenues.length}개)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <VenueListTable
            venues={filteredVenues}
            isLoading={isLoading}
            error={error?.message || null}
            onView={handleViewVenue}
            onEdit={handleEditVenue}
            onDelete={handleDeleteVenue}
          />
        </CardContent>
      </Card>

      {/* 공연장 삭제 확인 다이얼로그 */}
      <VenueDeleteDialog
        venue={deleteTarget}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteVenueMutation.isPending}
      />
    </div>
  );
}
