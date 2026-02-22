"use client";

/**
 * 공지사항 리스트 뷰 (Admin)
 * - NoticeCategory enum의 모든 카테고리를 표시
 * - 활성화된 공지사항이 있는 카테고리: 미리보기 카드 표시
 * - 활성화된 공지사항이 없는 카테고리: "등록된 공지사항이 없습니다." 메시지 표시
 * - 카테고리 헤더 클릭 시 해당 카테고리의 전체 공지사항 목록 다이얼로그 표시
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { NoticeGroupResponse } from "@/entities/notice";
import {
  NoticeCategory,
  NoticeGroupCard,
  useNoticesGrouped,
} from "@/entities/notice";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { NoticeCategoryDialog } from "./NoticeCategoryDialog";

/**
 * NoticeCategory enum 값에 대한 카테고리 설명 로컬 매핑
 * API 응답에 없는 카테고리(공지사항 없음)의 제목 표시에 사용
 */
const CATEGORY_DESCRIPTION_MAP: Record<NoticeCategory, string> = {
  [NoticeCategory.BOOKING_NOTICE]: "예매 유의사항",
  [NoticeCategory.BANK_TRANSFER_NOTICE]: "무통장입금 입금 시 주의사항",
  [NoticeCategory.TICKET_RECEIPT_GUIDE]: "티켓 수령안내",
  [NoticeCategory.MOBILE_TICKET_GUIDE]: "모바일 티켓 안내",
  [NoticeCategory.REFUND_GUIDE]: "환불 안내",
  [NoticeCategory.CANCELLATION_REFUND_NOTICE]: "취소 및 환불 유의사항",
};

/**
 * 다이얼로그에 전달할 선택된 카테고리 상태
 */
interface SelectedCategory {
  /** 카테고리 enum 값 */
  category: NoticeCategory;
  /** 카테고리 설명 */
  categoryDescription: string;
}

/**
 * 공지사항 리스트 뷰 컴포넌트
 * @returns 공지사항 리스트 뷰
 */
export function NoticeListView() {
  const router = useRouter();
  const { data: noticeGroups, isLoading } = useNoticesGrouped();
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);

  /**
   * 카테고리 헤더 클릭 핸들러 (공지사항 선택 다이얼로그 열기)
   * @param category - 카테고리 enum 값
   * @param categoryDescription - 카테고리 설명
   */
  const handleCategoryClick = (
    category: string,
    categoryDescription: string,
  ) => {
    setSelectedCategory({
      category: category as NoticeCategory,
      categoryDescription,
    });
  };

  /**
   * 새 공지사항 추가 버튼 클릭 핸들러
   */
  const handleCreateClick = () => {
    router.push(PAGES.ADMIN.NOTICES.CREATE.path);
  };

  /**
   * 모든 NoticeCategory enum 값을 순회하여 그룹 데이터 생성
   * - API 응답에 있는 카테고리: 실제 공지사항 데이터 사용
   * - API 응답에 없는 카테고리: 빈 notices 배열로 생성 (공지사항 없음)
   */
  const allCategories = Object.values(NoticeCategory);
  const groupedMap = new Map<string, NoticeGroupResponse>(
    (noticeGroups ?? []).map((g) => [g.category, g]),
  );

  const allGroups: NoticeGroupResponse[] = allCategories.map((category) => {
    return (
      groupedMap.get(category) ?? {
        category,
        categoryDescription: CATEGORY_DESCRIPTION_MAP[category] ?? category,
        notices: [],
      }
    );
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <Button onClick={handleCreateClick}>+ 새 공지사항</Button>
        </div>

        {/* 카테고리별 그룹 목록 - 모든 카테고리 표시 */}
        <div className="space-y-6">
          {allGroups.map((group) => (
            <NoticeGroupCard
              key={group.category}
              group={group}
              onCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>

      {/* 카테고리별 공지사항 선택 다이얼로그 */}
      <NoticeCategoryDialog
        category={selectedCategory?.category ?? null}
        categoryDescription={selectedCategory?.categoryDescription ?? ""}
        isOpen={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
      />
    </>
  );
}
