"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useVenues } from "@/entities/venue";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
  AGE_RATING_OPTIONS,
  PERFORMANCE_CATEGORIES,
  type PerformanceFormData,
  performanceFormSchema,
} from "../model/performance-form.schema";
import { VenueCombobox } from "./VenueCombobox";

/**
 * 공연 폼 모드 타입
 */
type PerformanceFormMode = "create" | "edit" | "view";

/**
 * 공연 폼 컴포넌트 속성
 */
interface PerformanceFormProps {
  /** 폼 모드 */
  mode: PerformanceFormMode;
  /** 초기 데이터 (수정/상세보기 시) */
  initialData?: PerformanceResponse;
  /** 제출 핸들러 */
  onSubmit: (data: PerformanceFormData) => Promise<void>;
  /** 제출 중 상태 */
  isSubmitting?: boolean;
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void;
}

/**
 * 모드별 제목 매핑
 */
const FORM_TITLES: Record<PerformanceFormMode, string> = {
  create: "공연 등록",
  edit: "공연 수정",
  view: "공연 상세",
};

/**
 * 모드별 버튼 텍스트 매핑
 */
const SUBMIT_BUTTON_TEXT: Record<
  PerformanceFormMode,
  { normal: string; loading: string }
> = {
  create: { normal: "등록", loading: "등록 중..." },
  edit: { normal: "수정", loading: "수정 중..." },
  view: { normal: "수정", loading: "수정 중..." },
};

/**
 * 재사용 가능한 공연 폼 컴포넌트
 */
export function PerformanceForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: PerformanceFormProps) {
  const router = useRouter();
  const isViewMode = mode === "view";

  // 공연장 목록 조회
  const { data: venues = [], isLoading: isVenuesLoading } = useVenues();

  // 폼 설정
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(performanceFormSchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      runningTime: initialData?.runningTime
        ? String(initialData.runningTime)
        : "",
      ageRating: initialData?.ageRating || "",
      mainImageUrl: initialData?.mainImageUrl || "",
      visible: initialData?.visible ?? true,
      venueId: initialData?.venue?.id || 0,
      startDate: initialData?.startDate
        ? initialData.startDate.split("T")[0]
        : "",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
    },
  });

  const watchedVisible = watch("visible");

  /**
   * 폼 제출 핸들러
   */
  const handleFormSubmit = async (data: PerformanceFormData) => {
    try {
      await onSubmit(data);

      if (mode === "create") {
        reset();
      }
    } catch (error) {
      // Zod 검증 에러 처리
      if (error instanceof Error) {
        console.error("폼 제출 오류:", error);

        // 특정 필드 에러인 경우 해당 필드에 표시
        if (error.message.includes("공연장")) {
          setError("venueId", { message: "공연장을 선택해주세요" });
        } else if (error.message.includes("공연 시간")) {
          setError("runningTime", {
            message: "올바른 공연 시간을 입력해주세요",
          });
        } else if (error.message.includes("URL")) {
          setError("mainImageUrl", { message: "올바른 URL을 입력해주세요" });
        }
      }

      // 에러를 다시 던져서 상위 컴포넌트에서 처리할 수 있도록 함
      throw error;
    }
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      isViewMode
        ? router.push(PAGES.ADMIN.PERFORMANCES.LIST.path)
        : router.back();
    }
  };

  /**
   * 공연장 선택 변경 핸들러
   */
  const handleVenueChange = (value: number | undefined) => {
    setValue("venueId", value || 0, { shouldValidate: true });
  };

  /**
   * 카테고리 선택 변경 핸들러
   */
  const handleCategoryChange = (value: string) => {
    setValue("category", value, { shouldValidate: true });
  };

  /**
   * 관람 연령 선택 변경 핸들러
   */
  const handleAgeRatingChange = (value: string) => {
    setValue("ageRating", value, { shouldValidate: true });
  };

  /**
   * 노출 여부 변경 핸들러
   */
  const handleVisibilityChange = (checked: boolean) => {
    setValue("visible", checked, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full max-w-4xl mx-auto"
    >
      {/* 버튼 그룹 */}
      <div className="flex gap-3 justify-end mb-3">
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
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 공연명 */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="required">
                  공연명
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="공연명을 입력하세요"
                  className={errors.title ? "border-red-500" : ""}
                  disabled={isViewMode}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* 카테고리 */}
              <div className="space-y-2">
                <Label className="required">카테고리</Label>
                <Select
                  value={watch("category")}
                  onValueChange={handleCategoryChange}
                  disabled={isViewMode}
                >
                  <SelectTrigger
                    className={cn(
                      errors.category ? "border-red-500" : "",
                      "w-full",
                    )}
                  >
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERFORMANCE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* 공연장 */}
              <div className="space-y-2">
                <Label className="required">공연장</Label>
                <VenueCombobox
                  venues={venues}
                  value={watch("venueId")}
                  onValueChange={handleVenueChange}
                  disabled={isViewMode}
                  loading={isVenuesLoading}
                  error={!!errors.venueId}
                  placeholder="공연장을 검색하여 선택하세요"
                />
                {errors.venueId && (
                  <p className="text-sm text-red-500">
                    {errors.venueId.message}
                  </p>
                )}
              </div>

              {/* 공연 시간 */}
              <div className="space-y-2">
                <Label htmlFor="runningTime">공연 시간 (분)</Label>
                <Input
                  id="runningTime"
                  type="number"
                  {...register("runningTime")}
                  placeholder="예: 120"
                  className={errors.runningTime ? "border-red-500" : ""}
                  disabled={isViewMode}
                  min={1}
                />
                {errors.runningTime && (
                  <p className="text-sm text-red-500">
                    {errors.runningTime.message}
                  </p>
                )}
              </div>

              {/* 관람 연령 */}
              <div className="space-y-2">
                <Label>관람 연령</Label>
                <Select
                  value={watch("ageRating")}
                  onValueChange={handleAgeRatingChange}
                  disabled={isViewMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="관람 연령을 선택하세요 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 공연 기간 */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="required">
                  시작일
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                  disabled={isViewMode}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="required">
                  종료일
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "border-red-500" : ""}
                  disabled={isViewMode}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-6">
              {/* 공연 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description">공연 설명</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="공연에 대한 상세 설명을 입력하세요 (선택사항)"
                  className={errors.description ? "border-red-500" : ""}
                  disabled={isViewMode}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* 대표 이미지 URL */}
              <div className="space-y-2">
                <Label htmlFor="mainImageUrl">대표 이미지 URL</Label>
                <Input
                  id="mainImageUrl"
                  {...register("mainImageUrl")}
                  placeholder="https://example.com/image.jpg (선택사항)"
                  className={errors.mainImageUrl ? "border-red-500" : ""}
                  disabled={isViewMode}
                />
                {errors.mainImageUrl && (
                  <p className="text-sm text-red-500">
                    {errors.mainImageUrl.message}
                  </p>
                )}
              </div>

              {/* 노출 여부 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visible"
                  checked={watchedVisible}
                  onCheckedChange={handleVisibilityChange}
                  disabled={isViewMode}
                />
                <Label htmlFor="visible">공연 노출</Label>
                <p className="text-sm text-gray-500">
                  체크 시 사용자에게 공연이 노출됩니다
                </p>
              </div>
            </div>

            {/* 메타데이터 (상세보기/수정 모드에서만 표시) */}
            {initialData && (mode === "edit" || mode === "view") && (
              <div className="space-y-4 pt-4 border-t">
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
