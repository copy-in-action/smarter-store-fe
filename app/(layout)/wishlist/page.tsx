import { PAGES } from "@/shared/config";
import { WishlistPage } from "@/views/service/wishlist";

export const metadata = PAGES.WISHLIST.metadata;

/**
 * 찜 목록 페이지
 * /wishlist 경로로 접근
 */
export default function Wishlist() {
  return <WishlistPage />;
}
