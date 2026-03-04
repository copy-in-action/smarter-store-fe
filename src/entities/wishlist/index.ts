/**
 * 찜하기 엔티티 Public API
 */

// API 함수
export {
  addWishlist,
  checkWishlistStatus,
  getMyWishlists,
  removeWishlist,
} from "./api/wishlist.api";

// React Query hooks
export {
  useWishlistInfiniteQuery,
  useWishlistStatusQuery,
  useWishlistToggleMutation,
  WISHLIST_QUERY_KEYS,
} from "./api/wishlist.queries";

// 타입
export type {
  GetMyWishlistsParams,
  PagedWishlistResponse,
  WishlistMetaResponse,
  WishlistResponse,
  WishlistStatusResponse,
} from "./model/wishlist.types";
