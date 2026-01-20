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
  /** 초기값 (YYYY-MM-DD 형식) */
  initialValues: Partial<UpdateCouponFormInput>;
  /** 제출 핸들러 (변경된 필드만, 서버 포맷으로 변환됨) */
  onSubmit: (data: Partial<CouponCreateRequest>) => Promise<void>;
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
   * 수정 모드일 때만 isActive 포함
   */
  const getDefaultValues = ():
    | CreateCouponFormInput
    | UpdateCouponFormInput => {
    return {
      name: initialValues?.name ?? "",
      validFrom: initialValues?.validFrom ?? "",
      validUntil: initialValues?.validUntil ?? "",
      discountRate: initialValues?.discountRate ?? 0,
      sortOrder: initialValues?.sortOrder ?? 0,
      ...(mode === "edit" && { isActive: initialValues?.isActive ?? true }),
    };
  };
  console.log("🚀 ~ CouponForm ~ getDefaultValues():", getDefaultValues());
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
   * dirtyFields를 활용해 변경된 필드만 추출 및 서버 포맷으로 변환
   * @param data - 검증된 폼 데이터
   */
  const handleOnSubmit = async (
    values: CouponFormInput | UpdateCouponFormInput,
  ) => {
    if (mode === "edit") {
      const data = values as UpdateCouponFormInput;
      // 수정 모드: 변경된 필드만 추출 (Type-Safe하게 처리)
      const { dirtyFields } = form.formState;
      const dirtyData: Partial<CouponUpdateRequest> = {};

      Object.keys(dirtyFields).forEach((key) => {
        const k = key as keyof UpdateCouponFormInput;
        const value = data[k];

        if (value === undefined) return;

        if (k === "validFrom" || k === "validUntil") {
          dirtyData[k] = formatToApi(value as string);
        } else {
          (dirtyData as any)[k] = value;
        }
      });

      await onSubmit(dirtyData);
    } else {
      // 생성 모드: 타입 단언을 통해 CreateInput임을 명시
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
                  form.setValue("isActive", checked as boolean)
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
