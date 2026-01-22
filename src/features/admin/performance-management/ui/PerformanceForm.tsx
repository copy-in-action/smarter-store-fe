"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useGetAllCompanies } from "@/entities/company";
import { useVenues } from "@/entities/venue";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
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
import { CompanyCombobox } from "./CompanyCombobox";
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

  // 판매자 목록 조회
  const { data: companies = [], isLoading: isCompaniesLoading } =
    useGetAllCompanies();

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
      visible: initialData?.visible ?? false,
      venueId: initialData?.venue?.id.toString() || "",
      companyId: initialData?.company?.id.toString() || "",
      startDate: initialData?.startDate
        ? initialData.startDate.split("T")[0]
        : "",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
      actors: initialData?.actors || "",
      agency: initialData?.agency || "",
      producer: initialData?.producer || "",
      host: initialData?.host || "",
      discountInfo: initialData?.discountInfo || "",
      usageGuide: initialData?.usageGuide || "",
      refundPolicy: initialData?.refundPolicy || "",
      detailImageUrl: initialData?.detailImageUrl || "",
      bookingFee: initialData?.bookingFee ? String(initialData.bookingFee) : "",
      shippingGuide: initialData?.shippingGuide || "",
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
        } else if (error.message.includes("판매자")) {
          setError("companyId", { message: "판매자를 선택해주세요" });
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
    setValue("venueId", value ? String(value) : "", { shouldValidate: true });
  };

  /**
   * 판매자 선택 변경 핸들러
   */
  const handleCompanyChange = (value: number | undefined) => {
    setValue("companyId", value ? String(value) : "", { shouldValidate: true });
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
                  value={Number(watch("venueId"))}
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

              {/* 판매자 */}
              <div className="space-y-2">
                <Label className="required">판매자</Label>
                <CompanyCombobox
                  companies={companies}
                  value={Number(watch("companyId"))}
                  onValueChange={handleCompanyChange}
                  disabled={isViewMode}
                  loading={isCompaniesLoading}
                  error={!!errors.companyId}
                  placeholder="판매자를 검색하여 선택하세요"
                />
                {errors.companyId && (
                  <p className="text-sm text-red-500">
                    {errors.companyId.message}
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

              {/* 상품상세 이미지 URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="detailImageUrl">상품상세 이미지 URL</Label>
                <Input
                  id="detailImageUrl"
                  {...register("detailImageUrl")}
                  placeholder="https://example.com/detail-image.jpg (선택사항)"
                  className={errors.detailImageUrl ? "border-red-500" : ""}
                  disabled={isViewMode}
                />
                {errors.detailImageUrl && (
                  <p className="text-sm text-red-500">
                    {errors.detailImageUrl.message}
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

            {/* 추가 정보 */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                추가 정보
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 출연진 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="actors">출연진</Label>
                  <Textarea
                    id="actors"
                    {...register("actors")}
                    placeholder="출연진 정보를 입력하세요 (선택사항)"
                    className={errors.actors ? "border-red-500" : ""}
                    disabled={isViewMode}
                    rows={3}
                  />
                  {errors.actors && (
                    <p className="text-sm text-red-500">
                      {errors.actors.message}
                    </p>
                  )}
                </div>

                {/* 기획사 (텍스트) */}
                <div className="space-y-2">
                  <Label htmlFor="agency">기획사</Label>
                  <Input
                    id="agency"
                    {...register("agency")}
                    placeholder="기획사명을 입력하세요 (선택사항)"
                    className={errors.agency ? "border-red-500" : ""}
                    disabled={isViewMode}
                  />
                  {errors.agency && (
                    <p className="text-sm text-red-500">
                      {errors.agency.message}
                    </p>
                  )}
                </div>

                {/* 제작사 */}
                <div className="space-y-2">
                  <Label htmlFor="producer">제작사</Label>
                  <Input
                    id="producer"
                    {...register("producer")}
                    placeholder="제작사명을 입력하세요 (선택사항)"
                    className={errors.producer ? "border-red-500" : ""}
                    disabled={isViewMode}
                  />
                  {errors.producer && (
                    <p className="text-sm text-red-500">
                      {errors.producer.message}
                    </p>
                  )}
                </div>

                {/* 주최 */}
                <div className="space-y-2">
                  <Label htmlFor="host">주최</Label>
                  <Input
                    id="host"
                    {...register("host")}
                    placeholder="주최자를 입력하세요 (선택사항)"
                    className={errors.host ? "border-red-500" : ""}
                    disabled={isViewMode}
                  />
                  {errors.host && (
                    <p className="text-sm text-red-500">
                      {errors.host.message}
                    </p>
                  )}
                </div>

                {/* 예매 수수료 */}
                <div className="space-y-2">
                  <Label htmlFor="bookingFee">예매 수수료 (원)</Label>
                  <Input
                    id="bookingFee"
                    type="number"
                    {...register("bookingFee")}
                    placeholder="예: 1000"
                    className={errors.bookingFee ? "border-red-500" : ""}
                    disabled={isViewMode}
                    min={0}
                    step={100}
                  />
                  {errors.bookingFee && (
                    <p className="text-sm text-red-500">
                      {errors.bookingFee.message}
                    </p>
                  )}
                </div>

                {/* 할인정보 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="discountInfo">할인정보</Label>
                  <Textarea
                    id="discountInfo"
                    {...register("discountInfo")}
                    placeholder="할인 혜택이나 프로모션 정보를 입력하세요 (선택사항)"
                    className={errors.discountInfo ? "border-red-500" : ""}
                    disabled={isViewMode}
                    rows={3}
                  />
                  {errors.discountInfo && (
                    <p className="text-sm text-red-500">
                      {errors.discountInfo.message}
                    </p>
                  )}
                </div>

                {/* 이용안내 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="usageGuide">이용안내</Label>
                  <Textarea
                    id="usageGuide"
                    {...register("usageGuide")}
                    placeholder="공연 관람 시 주의사항이나 안내사항을 입력하세요 (선택사항)"
                    className={errors.usageGuide ? "border-red-500" : ""}
                    disabled={isViewMode}
                    rows={4}
                  />
                  {errors.usageGuide && (
                    <p className="text-sm text-red-500">
                      {errors.usageGuide.message}
                    </p>
                  )}
                </div>

                {/* 취소/환불규정 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="refundPolicy">취소/환불규정</Label>
                  <Textarea
                    id="refundPolicy"
                    {...register("refundPolicy")}
                    placeholder="취소 및 환불 정책을 입력하세요 (선택사항)"
                    className={errors.refundPolicy ? "border-red-500" : ""}
                    disabled={isViewMode}
                    rows={4}
                  />
                  {errors.refundPolicy && (
                    <p className="text-sm text-red-500">
                      {errors.refundPolicy.message}
                    </p>
                  )}
                </div>

                {/* 배송 안내 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shippingGuide">배송 안내</Label>
                  <Textarea
                    id="shippingGuide"
                    {...register("shippingGuide")}
                    placeholder="티켓 배송 관련 안내사항을 입력하세요 (선택사항)"
                    className={errors.shippingGuide ? "border-red-500" : ""}
                    disabled={isViewMode}
                    rows={3}
                  />
                  {errors.shippingGuide && (
                    <p className="text-sm text-red-500">
                      {errors.shippingGuide.message}
                    </p>
                  )}
                </div>
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
