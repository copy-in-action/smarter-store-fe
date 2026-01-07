import { PAGES } from "@/shared/constants";
import { CouponCreateView } from "@/views/admin/coupon/create";

export const metadata = PAGES.ADMIN.COUPON.CREATE.metadata;

/**
 * 쿠폰 생성 페이지 (Admin)
 */
export default function CouponCreatePage() {
  return <CouponCreateView />;
}
