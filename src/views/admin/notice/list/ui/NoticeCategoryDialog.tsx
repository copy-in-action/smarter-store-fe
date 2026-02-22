"use client";

/**
 * 카테고리별 공지사항 선택 다이얼로그 (Admin)
 * - list 뷰: 카테고리 전체 공지사항 목록 + 검색 + 활성화 토글
 * - detail 뷰: 선택된 공지사항 상세 내용 + 인라인 수정/삭제
 * - "목록으로" 클릭 시 list 뷰로 복귀
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  NoticeCategory,
  type UpdateNoticeForm,
  updateNoticeSchema,
  useDeleteNotice,
  useNotices,
  useUpdateNotice,
  useUpdateNoticeStatus,
} from "@/entities/notice";
import { cn } from "@/shared/lib/utils";
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
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Textarea } from "@/shared/ui/textarea";

/**
 * 카테고리 옵션 목록
 */
const CATEGORY_OPTIONS = [
  { value: NoticeCategory.BOOKING_NOTICE, label: "예매 유의사항" },
  {
    value: NoticeCategory.BANK_TRANSFER_NOTICE,
    label: "무통장입금 입금 시 주의사항",
  },
  {
    value: NoticeCategory.TICKET_RECEIPT_GUIDE,
    label: "티켓 수령안내",
  },
  {
    value: NoticeCategory.MOBILE_TICKET_GUIDE,
    label: "모바일 티켓 안내",
  },
  { value: NoticeCategory.REFUND_GUIDE, label: "환불 안내" },
  {
    value: NoticeCategory.CANCELLATION_REFUND_NOTICE,
    label: "취소 및 환불 유의사항",
  },
] as const;

/**
 * NoticeCategoryDialog Props
 */
interface NoticeCategoryDialogProps {
  /** 선택된 카테고리 */
  category: NoticeCategory | null;
  /** 카테고리 설명 (다이얼로그 제목) */
  categoryDescription: string;
  /** 다이얼로그 열림 여부 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
}

/**
 * 토글 확인 대기 중인 공지사항 상태
 */
interface PendingToggle {
  /** 공지사항 ID */
  id: number;
  /** 현재 활성화 여부 (토글 후 반전됨) */
  currentIsActive: boolean;
}

/**
 * 다이얼로그 내 뷰 상태
 * - list: 카테고리 공지사항 목록
 * - detail: 선택된 공지사항 상세
 */
type DialogView = "list" | "detail";

/**
 * 카테고리별 공지사항 선택 다이얼로그 컴포넌트
 * @param props - NoticeCategoryDialog Props
 * @returns 공지사항 선택 다이얼로그
 */
export function NoticeCategoryDialog({
  category,
  categoryDescription,
  isOpen,
  onClose,
}: NoticeCategoryDialogProps) {
  const [view, setView] = useState<DialogView>("list");
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: allNotices, isLoading } = useNotices();
  const { mutateAsync: updateStatus, isPending: isStatusPending } =
    useUpdateNoticeStatus();
  const { mutateAsync: deleteNotice, isPending: isDeletePending } =
    useDeleteNotice();
  const { mutateAsync: updateNotice, isPending: isUpdatePending } =
    useUpdateNotice();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNoticeForm>({
    resolver: zodResolver(updateNoticeSchema),
  });

  /**
   * 선택된 카테고리 + 검색어로 필터링된 공지사항 목록
   * - 카테고리 필터: 선택된 카테고리만
   * - 검색 필터: 검색어가 있으면 content 포함 여부 확인 (대소문자 무관)
   */
  const filteredNotices = (allNotices ?? []).filter((notice) => {
    const matchesCategory = notice.category === category;
    const matchesSearch =
      searchQuery.trim() === "" ||
      notice.content.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /** 현재 상세 보기 중인 공지사항 데이터 */
  const selectedNotice = selectedNoticeId
    ? ((allNotices ?? []).find((n) => n.id === selectedNoticeId) ?? null)
    : null;

  /**
   * 선택된 공지사항이 바뀔 때마다 폼 초기값 재설정
   */
  useEffect(() => {
    if (selectedNotice) {
      reset({
        content: selectedNotice.content,
      });
    }
  }, [selectedNotice, reset]);

  /**
   * 상세 뷰로 전환
   * @param noticeId - 상세 볼 공지사항 ID
   */
  const handleDetailClick = (noticeId: number) => {
    setSelectedNoticeId(noticeId);
    setView("detail");
    setIsEditing(false);
  };

  /** 목록 뷰로 복귀 */
  const handleBackToList = () => {
    setSelectedNoticeId(null);
    setView("list");
    setIsEditing(false);
  };

  /**
   * 다이얼로그 완전 닫기 - 모든 상태 초기화
   */
  const handleClose = () => {
    setView("list");
    setSelectedNoticeId(null);
    setSearchQuery("");
    setPendingToggle(null);
    setShowDeleteConfirm(false);
    setIsEditing(false);
    onClose();
  };

  /**
   * 수정 취소 - 폼을 원본 데이터로 초기화
   */
  const handleCancelEdit = () => {
    if (selectedNotice) {
      reset({
        content: selectedNotice.content,
      });
    }
    setIsEditing(false);
  };

  /**
   * 폼 제출 핸들러 - 공지사항 수정 저장
   * @param data - 수정할 category, content
   */
  const handleSaveEdit = handleSubmit(async (data) => {
    if (!selectedNoticeId) return;
    try {
      await updateNotice({ id: selectedNoticeId, data });
      toast.success("공지사항이 수정되었습니다.");
      setIsEditing(false);
    } catch {
      toast.error("공지사항 수정에 실패했습니다.");
    }
  });

  /**
   * 활성화/비활성화 토글 확인 후 상태 변경
   * - 현재 활성 → 비활성화 요청
   * - 현재 비활성 → 활성화 요청
   */
  const handleToggleConfirm = async () => {
    if (!pendingToggle) return;
    const nextIsActive = !pendingToggle.currentIsActive;
    try {
      await updateStatus({
        id: pendingToggle.id,
        data: { isActive: nextIsActive },
      });
      toast.success(
        nextIsActive
          ? "공지사항이 활성화되었습니다."
          : "공지사항이 비활성화되었습니다.",
      );
      setPendingToggle(null);
    } catch {
      toast.error("상태 변경 중 오류가 발생했습니다.");
    }
  };

  /**
   * 공지사항 삭제 확인 후 처리
   * 삭제 성공 시 목록 뷰로 복귀
   */
  const handleDeleteConfirm = async () => {
    if (!selectedNoticeId) return;
    try {
      await deleteNotice(selectedNoticeId);
      toast.success("공지사항이 삭제되었습니다.");
      setShowDeleteConfirm(false);
      handleBackToList();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const dialogTitle =
    view === "list"
      ? `${categoryDescription} 공지사항 목록`
      : `${categoryDescription} 공지사항 상세`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {/* ── LIST VIEW ── */}
          {view === "list" && (
            <>
              {/* 검색 입력 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9!"
                />
              </div>

              {/* 스크롤 가능한 공지사항 목록 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {isLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    로딩 중...
                  </p>
                ) : filteredNotices.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {searchQuery.trim()
                      ? "검색 결과가 없습니다."
                      : "등록된 공지사항이 없습니다."}
                  </p>
                ) : (
                  filteredNotices.map((notice) => (
                    <Card
                      key={notice.id}
                      className={cn(
                        "transition-colors",
                        notice.isActive && "border-2 border-primary",
                      )}
                    >
                      <CardContent className="space-y-3">
                        {/* 상단: 상태 배지 + 날짜 | 활성화 토글 + 상세보기 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                notice.isActive ? "default" : "secondary"
                              }
                            >
                              {notice.isActive ? "활성" : "비활성"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {notice.updatedAt
                                ? new Date(notice.updatedAt).toLocaleDateString(
                                    "ko-KR",
                                  )
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={
                                notice.isActive ? "secondary" : "default"
                              }
                              size="sm"
                              disabled={isStatusPending}
                              onClick={() =>
                                setPendingToggle({
                                  id: notice.id,
                                  currentIsActive: notice.isActive,
                                })
                              }
                            >
                              {notice.isActive ? "비활성화" : "활성화"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDetailClick(notice.id)}
                            >
                              상세보기
                            </Button>
                          </div>
                        </div>

                        {/* 내용 미리보기 */}
                        <p className="max-h-60 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                          {notice.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── DETAIL VIEW ── */}
          {view === "detail" && selectedNotice && (
            <form
              onSubmit={handleSaveEdit}
              className="flex flex-1 flex-col gap-4 overflow-y-auto"
            >
              {/* 상단 액션 버튼 */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="gap-1 pl-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  목록으로
                </Button>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isUpdatePending}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isUpdatePending}
                      >
                        {isUpdatePending ? "저장 중..." : "저장"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        수정
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeletePending}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* 메타 정보 */}
              <div className="space-y-3">
                {/* 카테고리 */}
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                    카테고리
                  </span>

                  <Select
                    defaultValue={category || ""}
                    value={selectedNotice.category}
                    disabled
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 상태 */}
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                    상태
                  </span>
                  <Badge
                    variant={selectedNotice.isActive ? "default" : "secondary"}
                  >
                    {selectedNotice.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>

                {/* 수정일 */}
                {selectedNotice.updatedAt && (
                  <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                      수정일
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedNotice.updatedAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* 내용 */}
              <div className="space-y-2">
                <span className="text-sm font-medium">내용</span>
                <Textarea
                  {...register("content")}
                  readOnly={!isEditing}
                  rows={8}
                  className={cn(
                    "resize-none",
                    !isEditing && "cursor-default bg-muted/30",
                  )}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 활성화/비활성화 확인 AlertDialog */}
      <AlertDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => !open && setPendingToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              공지사항 {pendingToggle?.currentIsActive ? "비활성화" : "활성화"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.currentIsActive
                ? "이 공지사항을 비활성화하시겠습니까?"
                : "이 공지사항을 활성화하면 동일 카테고리의 현재 활성화된 공지사항이 자동으로 비활성화됩니다. 계속하시겠습니까?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStatusPending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleConfirm}
              disabled={isStatusPending}
            >
              {isStatusPending ? "처리 중..." : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 공지사항을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletePending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
