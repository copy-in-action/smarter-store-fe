"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeactivateCoupon, useGetAllCoupons } from "@/entities/coupon";
import { CouponDataTable } from "@/features/admin/coupon-table";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 쿠폰 리스트 뷰 (Admin - React Query)
 */
export function CouponListView() {
  const router = useRouter();
  const { data, isLoading } = useGetAllCoupons();
  const deactivateMutation = useDeactivateCoupon();

  /**
   * 쿠폰 비활성화 핸들러
   * @param id - 쿠폰 ID
   */
  const handleDeactivate = async (id: number) => {
    if (!confirm("쿠폰을 비활성화하시겠습니까?")) return;

    deactivateMutation.mutate(id, {
      onSuccess: () => {
        toast.success("쿠폰이 비활성화되었습니다.");
      },
      onError: (error) => {
        console.error("비활성화 실패:", error);
        toast.error("쿠폰 비활성화에 실패했습니다.");
      },
    });
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">쿠폰 관리</h1>
        <Button onClick={() => router.push(PAGES.ADMIN.COUPON.CREATE.path)}>
          쿠폰 추가
        </Button>
      </div>
      <CouponDataTable data={data || []} onDeactivate={handleDeactivate} />
    </div>
  );
}
