import { PAGES } from "@/shared/config";
import { CouponEditView } from "@/views/admin/coupon/edit";

export const metadata = PAGES.ADMIN.COUPON.EDIT.metadata;

/**
 * 쿠폰 수정 페이지 Props
 */
interface Props {
  /** 동적 라우트 파라미터 */
  params: Promise<{ id: string }>;
}

/**
 * 쿠폰 수정 페이지 (Admin)
 * @param params - 라우트 파라미터
 */
export default async function CouponEditPage({ params }: Props) {
  const { id } = await params;
  const couponId = Number(id);
  return <CouponEditView couponId={couponId} />;
}
