import { PAGES } from "@/shared/constants";
import { CouponListView } from "@/views/admin/coupon/list";

export const metadata = PAGES.ADMIN.COUPON.LIST.metadata;

/**
 * 쿠폰 리스트 페이지 (Admin - React Query)
 */
export default function CouponListPage() {
  return <CouponListView />;
}
