"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { VenueResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  type VenueFormData,
  venueFormSchema,
} from "../model/venue-form.schema";

/**
 * 공연장 폼 모드 타입
 */
type VenueFormMode = "create" | "edit" | "view";

/**
 * 공연장 폼 컴포넌트 속성
 */
interface VenueFormProps {
  /** 폼 모드 */
  mode: VenueFormMode;
  /** 초기 데이터 (수정/상세보기 시) */
  initialData?: VenueResponse;
  /** 제출 핸들러 */
  onSubmit: (data: VenueFormData) => Promise<void>;
  /** 제출 중 상태 */
  isSubmitting?: boolean;
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void;
}

/**
 * 모드별 제목 매핑
 */
const FORM_TITLES: Record<VenueFormMode, string> = {
  create: "공연장 등록",
  edit: "공연장 수정",
  view: "공연장 상세",
};

/**
 * 모드별 버튼 텍스트 매핑
 */
const SUBMIT_BUTTON_TEXT: Record<
  VenueFormMode,
  { normal: string; loading: string }
> = {
  create: { normal: "등록", loading: "등록 중..." },
  edit: { normal: "수정", loading: "수정 중..." },
  view: { normal: "수정", loading: "수정 중..." },
};

/**
 * 재사용 가능한 공연장 폼 컴포넌트
 */
export function VenueForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: VenueFormProps) {
  const router = useRouter();
  const isViewMode = mode === "view";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      phoneNumber: initialData?.phoneNumber || "",
    },
  });

  /**
   * 폼 제출 핸들러
   */
  const handleFormSubmit = async (data: VenueFormData) => {
    try {
      await onSubmit(data);

      if (mode === "create") {
        reset();
      }
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
      console.error("폼 제출 오류:", error);
    }
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      isViewMode ? router.push(PAGES.ADMIN.VENUES.LIST.path) : router.back();
    }
  };

  const handleCreateSeatingChart = () => {
    const params = new URLSearchParams({
      venueId: initialData?.id.toString() || "0",
      name: initialData?.name || "",
    });
    router.push(
      `${PAGES.ADMIN.VENUES.SEATING_CHART.CREATE.path}?${params.toString()}`,
    );
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full max-w-2xl mx-auto"
    >
      {/* 버튼 그룹 */}
      <div className="flex justify-end gap-3 mb-3">
        {isViewMode && (
          <Button onClick={handleCreateSeatingChart}>배치도 등록/수정</Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {isViewMode ? "목록으로" : "취소"}
        </Button>
        {!isViewMode && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? SUBMIT_BUTTON_TEXT[mode].loading
              : SUBMIT_BUTTON_TEXT[mode].normal}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{FORM_TITLES[mode]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 공연장 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                공연장 이름
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="공연장 이름을 입력하세요"
                className={errors.name ? "border-red-500" : ""}
                disabled={isViewMode}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 공연장 주소 */}
            <div className="space-y-2">
              <Label htmlFor="address">공연장 주소</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="공연장 주소를 입력하세요 (선택사항)"
                className={errors.address ? "border-red-500" : ""}
                disabled={isViewMode}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* 좌석 배치도 URL */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">좌석 배치도 URL</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="좌석 배치도 이미지 URL을 입력하세요 (선택사항)"
                className={errors.phoneNumber ? "border-red-500" : ""}
                disabled={isViewMode}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* 메타데이터 (상세보기/수정 모드에서만 표시) */}
            {initialData && (mode === "edit" || mode === "view") && (
              <div className="pt-4 space-y-4 border-t">
                <h3 className="font-medium text-gray-900">메타데이터</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">생성일</Label>
                    <p className="text-sm">
                      {initialData.createdAt
                        ? new Date(initialData.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )
                        : "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">수정일</Label>
                    <p className="text-sm">
                      {initialData.updatedAt
                        ? new Date(initialData.updatedAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
