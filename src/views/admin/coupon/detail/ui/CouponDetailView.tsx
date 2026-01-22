"use client";

import { useRouter } from "next/navigation";
import { useGetCoupon } from "@/entities/coupon";
import { PAGES } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * 쿠폰 상세 뷰 Props
 */
interface CouponDetailViewProps {
  /** 쿠폰 ID */
  couponId: number;
}

/**
 * 쿠폰 상세 뷰 (Admin - React Query)
 * @param couponId - 쿠폰 ID
 */
export function CouponDetailView({ couponId }: CouponDetailViewProps) {
  const router = useRouter();
  const { data, isLoading } = useGetCoupon(couponId);

  /**
   * 목록 버튼 클릭 핸들러
   */
  const handleListClick = () => {
    router.push(PAGES.ADMIN.COUPON.LIST.path);
  };

  /**
   * 수정 버튼 클릭 핸들러
   */
  const handleEditClick = () => {
    router.push(PAGES.ADMIN.COUPON.EDIT.path(couponId));
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!data) {
    return <div>쿠폰을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">쿠폰 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleListClick}>
            목록
          </Button>
          <Button onClick={handleEditClick}>수정</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.name}
            <Badge variant={data.isActive ? "default" : "secondary"}>
              {data.isActive ? "활성" : "비활성"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex">
              <dt className="w-32 font-semibold text-muted-foreground">
                쿠폰 ID
              </dt>
              <dd>{data.id}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-semibold text-muted-foreground">
                할인율
              </dt>
              <dd>{data.discountRate}%</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-semibold text-muted-foreground">
                유효 시작일
              </dt>
              <dd>{data.validFrom}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-semibold text-muted-foreground">
                유효 종료일
              </dt>
              <dd>{data.validUntil}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-semibold text-muted-foreground">
                정렬 순서
              </dt>
              <dd>{data.sortOrder}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
