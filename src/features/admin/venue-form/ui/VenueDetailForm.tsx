"use client";

import { useRouter } from "next/navigation";
import type { VenueResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import type { VenueFormData } from "../model/venue-form.schema";
import { VenueForm } from "./VenueForm";

/**
 * 공연장 상세보기 폼 컴포넌트 속성
 */
interface VenueDetailFormProps {
  /** 상세보기할 공연장 데이터 */
  venue: VenueResponse;
}

/**
 * 공연장 상세보기 폼 컴포넌트
 */
export function VenueDetailForm({ venue }: VenueDetailFormProps) {
  const router = useRouter();

  /**
   * 더미 제출 핸들러 (상세보기 모드에서는 사용되지 않음)
   */
  const handleSubmit = async (data: VenueFormData) => {
    // 상세보기 모드에서는 제출되지 않음
  };

  /**
   * 수정 페이지로 이동
   */
  const handleEdit = () => {
    router.push(PAGES.ADMIN.VENUES.EDIT.path(venue.id));
  };

  return (
    <div className="space-y-6">
      <VenueForm mode="view" initialData={venue} onSubmit={handleSubmit} />

      {/* 추가 액션 버튼 */}
      <div className="flex justify-center">
        <Button onClick={handleEdit} className="w-32">
          수정하기
        </Button>
      </div>
    </div>
  );
}
