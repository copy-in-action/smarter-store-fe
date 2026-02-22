"use client";

/**
 * 공지사항 생성 뷰 (Admin)
 * - NoticeForm 컴포넌트 렌더링
 * - 생성 성공 시 리스트 페이지로 이동
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateNotice, type CreateNoticeRequest } from "@/entities/notice";
import { NoticeForm } from "@/features/admin/notice-form";
import { PAGES } from "@/shared/config";

/**
 * 공지사항 생성 뷰 컴포넌트
 * @returns 공지사항 생성 뷰
 */
export function NoticeCreateView() {
  const router = useRouter();
  const createMutation = useCreateNotice();

  /**
   * 폼 제출 핸들러
   * @param data - 검증된 폼 데이터
   */
  const handleSubmit = async (data: CreateNoticeRequest) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("공지사항이 등록되었습니다.");
      router.push(PAGES.ADMIN.NOTICES.LIST.path);
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      toast.error("공지사항 등록에 실패했습니다.");
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    router.push(PAGES.ADMIN.NOTICES.LIST.path);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">공지사항 등록</h1>
      <NoticeForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
