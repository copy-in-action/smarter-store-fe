"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetCoupon, useUpdateCoupon } from "@/entities/coupon";
import { CouponForm } from "@/features/admin/coupon-form";
import type { CouponUpdateRequest } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";

/**
 * 쿠폰 수정 뷰 Props
 */
interface CouponEditViewProps {
  /** 쿠폰 ID */
  couponId: number;
}

/**
 * ISO String을 YYYY-MM-DD 형식으로 변환
 * @param isoString - ISO 형식 날짜 문자열
 * @returns YYYY-MM-DD 형식 문자열
 */
const formatDateForInput = (isoString: string): string => {
  // "2024-01-15T00:00:00.000Z" → "2024-01-15"
  return isoString.split("T")[0];
};

/**
 * 쿠폰 수정 뷰 (Admin - React Query)
 * @param couponId - 쿠폰 ID
 */
export function CouponEditView({ couponId }: CouponEditViewProps) {
  const router = useRouter();
  const { data, isLoading } = useGetCoupon(couponId);
  const updateCoupon = useUpdateCoupon();

  /**
   * 폼 제출 핸들러 (변경된 필드만 서버 포맷으로 전달됨)
   * @param formData - dirtyFields만 포함된 데이터 (ISO String 포맷)
   */
  const handleSubmit = async (formData: Partial<CouponUpdateRequest>) => {
    try {
      // 패칭된 값이 없을 순 없지만 타입 에러를 해결하기 위해 추가.
      if (!data) return;
      // 전체 필드 구성 (변경된 필드 + 기존 필드)
      const updateData: CouponUpdateRequest = {
        name: formData.name ?? data.name,
        discountRate: formData.discountRate ?? data.discountRate,
        validFrom: formData.validFrom ?? data.validFrom,
        validUntil: formData.validUntil ?? data.validUntil,
        isActive: formData.isActive ?? data.isActive,
        sortOrder: formData.sortOrder ?? data.sortOrder,
      };

      await updateCoupon.mutateAsync({ id: couponId, data: updateData });
      toast.success("쿠폰이 수정되었습니다.");
      router.push(PAGES.ADMIN.COUPON.DETAIL.path(couponId));
    } catch (error) {
      console.error("수정 실패:", error);
      toast.error("쿠폰 수정에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!data) {
    return <div>쿠폰을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">쿠폰 수정</h1>
      <CouponForm
        mode="edit"
        initialValues={{
          name: data.name,
          discountRate: data.discountRate,
          validFrom: formatDateForInput(data.validFrom),
          validUntil: formatDateForInput(data.validUntil),
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        }}
        onSubmit={handleSubmit}
        isLoading={updateCoupon.isPending}
      />
    </div>
  );
}
