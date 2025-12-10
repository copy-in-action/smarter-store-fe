"use client";

/**
 * 공연장 생성 폼 컴포넌트
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateVenue } from "@/entities/venue";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  type VenueFormData,
  venueFormSchema,
} from "../model/venue-form.schema";

/**
 * 공연장 생성 폼 컴포넌트
 */
export function VenueCreateForm() {
  const createVenueMutation = useCreateVenue();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: "",
      address: "",
      seatingChartUrl: "",
    },
  });

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = async (data: VenueFormData) => {
    try {
      const submitData = {
        name: data.name,
        address: data.address || undefined,
        seatingChartUrl: data.seatingChartUrl || undefined,
      };

      await createVenueMutation.mutateAsync(submitData);

      toast.success("공연장이 성공적으로 등록되었습니다.");
      reset();
    } catch (error) {
      toast.error("공연장 등록에 실패했습니다.");
      console.error("공연장 생성 오류:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>공연장 등록</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* 좌석 배치도 URL */}
          <div className="space-y-2">
            <Label htmlFor="seatingChartUrl">좌석 배치도 URL</Label>
            <Input
              id="seatingChartUrl"
              {...register("seatingChartUrl")}
              placeholder="좌석 배치도 이미지 URL을 입력하세요 (선택사항)"
              className={errors.seatingChartUrl ? "border-red-500" : ""}
            />
            {errors.seatingChartUrl && (
              <p className="text-sm text-red-500">
                {errors.seatingChartUrl.message}
              </p>
            )}
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                router.back();
              }}
            >
              취소
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || createVenueMutation.isPending}
            >
              {isSubmitting || createVenueMutation.isPending
                ? "등록 중..."
                : "등록"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
