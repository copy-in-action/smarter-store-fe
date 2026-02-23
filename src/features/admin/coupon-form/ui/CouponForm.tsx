"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  CouponCreateRequest,
  CouponUpdateRequest,
} from "@/shared/api/orval/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
  type CouponFormInput,
  type CreateCouponFormInput,
  createCouponFormSchema,
  type UpdateCouponFormInput,
  updateCouponFormSchema,
} from "../model/coupon-form.schema";

/**
 * 쿠폰 생성 폼 Props
 */
type CreateProps = {
  /** 생성 모드 */
  mode: "create";
  /** 초기값 (없음) */
  initialValues?: never;
  /** 제출 핸들러 (서버 포맷으로 변환된 데이터) */
  onSubmit: (data: CouponCreateRequest) => Promise<void>;
  /** 로딩 상태 */
  isLoading?: boolean;
};

/**
 * 쿠폰 수정 폼 Props
 */
type EditProps = {
  /** 수정 모드 */
  mode: "edit";
  /** 초기값 (YYYY-MM-DD 형식, 모든 필드 필수) */
  initialValues: UpdateCouponFormInput;
  /** 제출 핸들러 (PUT 메소드: 전체 필드, 서버 포맷으로 변환됨) */
  onSubmit: (data: CouponUpdateRequest) => Promise<void>;
  /** 로딩 상태 */
  isLoading?: boolean;
};

/**
 * 쿠폰 폼 Props (Discriminated Union)
 */
type CouponFormProps = CreateProps | EditProps;

/**
 * 쿠폰 생성/수정 폼 컴포넌트
 * @param mode - 생성 또는 수정 모드
 * @param initialValues - 폼 초기값
 * @param onSubmit - 제출 핸들러
 * @param isLoading - 로딩 상태
 */
export function CouponForm({
  mode,
  initialValues,
  onSubmit,
  isLoading,
}: CouponFormProps) {
  /**
   * 기본 초기값 설정
   * - 생성 모드: 빈 값
   * - 수정 모드: initialValues 그대로 사용 (모든 필드 필수)
   */
  const getDefaultValues = ():
    | CreateCouponFormInput
    | UpdateCouponFormInput => {
    if (mode === "edit") {
      return initialValues;
    }
    return {
      name: "",
      validFrom: "",
      validUntil: "",
      discountRate: 0,
      sortOrder: 0,
    };
  };

  const form = useForm<CreateCouponFormInput | UpdateCouponFormInput>({
    resolver: zodResolver(
      mode === "edit" ? updateCouponFormSchema : createCouponFormSchema,
    ),
    defaultValues: getDefaultValues(),
  });

  /**
   * YYYY-MM-DD → ISO String 변환 헬퍼
   * @param dateString - YYYY-MM-DD 형식 날짜 문자열
   * @returns ISO 형식 날짜 문자열
   */
  const formatToApi = (dateString: string): string => {
    return new Date(dateString).toISOString();
  };

  /**
   * 폼 제출 핸들러
   * PUT 메소드 사용: 전체 데이터를 서버 포맷으로 변환하여 전송
   * @param values - 검증된 폼 데이터
   */
  const handleOnSubmit = async (
    values: CouponFormInput | UpdateCouponFormInput,
  ) => {
    if (mode === "edit") {
      const data = values as UpdateCouponFormInput;
      // 수정 모드: 전체 데이터를 서버 포맷으로 변환 (PUT 메소드)
      const updateData: CouponUpdateRequest = {
        name: data.name,
        discountRate: data.discountRate,
        validFrom: formatToApi(data.validFrom),
        validUntil: formatToApi(data.validUntil),
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      };
      await onSubmit(updateData);
    } else {
      // 생성 모드: 전체 데이터를 서버 포맷으로 변환
      const data = values as CreateCouponFormInput;
      const createData: CouponCreateRequest = {
        name: data.name,
        discountRate: data.discountRate,
        validFrom: formatToApi(data.validFrom),
        validUntil: formatToApi(data.validUntil),
        sortOrder: data.sortOrder,
      };
      await onSubmit(createData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "쿠폰 등록" : "쿠폰 수정"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleOnSubmit)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">
              쿠폰명
            </label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="쿠폰명 입력"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="discountRate"
              className="block mb-1 text-sm font-medium"
            >
              할인율 (%)
            </label>
            <Input
              id="discountRate"
              type="number"
              {...form.register("discountRate", { valueAsNumber: true })}
              placeholder="할인율 입력 (예: 10)"
            />
            {form.formState.errors.discountRate && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.discountRate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="validFrom"
              className="block mb-1 text-sm font-medium"
            >
              유효 시작일
            </label>
            <Input id="validFrom" type="date" {...form.register("validFrom")} />
            {form.formState.errors.validFrom && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.validFrom.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="validUntil"
              className="block mb-1 text-sm font-medium"
            >
              유효 종료일
            </label>
            <Input
              id="validUntil"
              type="date"
              {...form.register("validUntil")}
            />
            {form.formState.errors.validUntil && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.validUntil.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="sortOrder"
              className="block mb-1 text-sm font-medium"
            >
              정렬 순서
            </label>
            <Input
              id="sortOrder"
              type="number"
              {...form.register("sortOrder", { valueAsNumber: true })}
              placeholder="정렬 순서 입력 (낮을수록 먼저 표시)"
            />
            {form.formState.errors.sortOrder && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.sortOrder.message}
              </p>
            )}
          </div>

          {mode === "edit" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={form.watch("isActive") ?? true}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked as boolean, {
                    shouldDirty: true,
                  })
                }
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                활성화
              </label>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "처리 중..." : mode === "create" ? "등록" : "수정"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
