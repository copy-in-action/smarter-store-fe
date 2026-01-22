"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCoupon } from "@/entities/coupon";
import { CouponForm } from "@/features/admin/coupon-form";
import type { CouponCreateRequest } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";

/**
 * 쿠폰 생성 뷰
 */
export function CouponCreateView() {
  const router = useRouter();
  const { mutateAsync } = useCreateCoupon();

  /**
   * 폼 제출 핸들러 (서버 포맷으로 변환된 데이터)
   * @param data - 검증 및 변환된 폼 데이터 (ISO String 포맷)
   */
  const handleSubmit = async (data: CouponCreateRequest) => {
    try {
      await mutateAsync(data);
      toast.success("쿠폰이 생성되었습니다.");
      router.push(PAGES.ADMIN.COUPON.LIST.path);
    } catch (error) {
      console.error("생성 실패:", error);
      toast.error("쿠폰 생성에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">쿠폰 등록</h1>
      <CouponForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
