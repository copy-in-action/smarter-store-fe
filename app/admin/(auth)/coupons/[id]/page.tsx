import { PAGES } from "@/shared/constants";
import { CouponDetailView } from "@/views/admin/coupon/detail";

export const metadata = PAGES.ADMIN.COUPON.DETAIL.metadata;

/**
 * 쿠폰 상세 페이지 Props
 */
interface Props {
  /** 동적 라우트 파라미터 */
  params: Promise<{ id: string }>;
}

/**
 * 쿠폰 상세 페이지 (Admin)
 * @param params - 라우트 파라미터
 */
export default async function CouponDetailPage({ params }: Props) {
  const { id } = await params;
  const couponId = Number(id);
  return <CouponDetailView couponId={couponId} />;
}
