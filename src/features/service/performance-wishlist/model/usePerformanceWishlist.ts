/**
 * 공연 찜하기 비즈니스 로직
 */

"use client";

import { useAuth } from "@/entities/user/model/user-context";
import {
  useWishlistStatusQuery,
  useWishlistToggleMutation,
} from "@/entities/wishlist";

/**
 * 공연 찜하기 hook
 * 찜 여부 조회 및 토글 기능 제공
 * @param performanceId - 공연 ID
 */
export function usePerformanceWishlist(performanceId: number) {
  const { user, isLoading: isAuthLoading } = useAuth();

  // 찜 여부 조회 (로그인한 경우에만 실행)
  const {
    data: wishlistStatus,
    isLoading: isWishlistLoading,
    error,
  } = useWishlistStatusQuery(performanceId);

  // 찜 토글 mutation
  const toggleMutation = useWishlistToggleMutation(performanceId);

  /**
   * 찜하기/찜 취소 토글
   */
  const handleToggle = () => {
    if (!user) {
      return; // 비로그인 상태에서는 부모 컴포넌트에서 처리
    }

    const isCurrentlyWishlisted = wishlistStatus?.isWishlisted ?? false;
    toggleMutation.mutate(isCurrentlyWishlisted);
  };

  return {
    /** 로그인 여부 */
    isAuthenticated: !!user,
    /** 찜 여부 (비로그인 시 false) */
    isWishlisted: wishlistStatus?.isWishlisted ?? false,
    /** 로딩 상태 (인증 로딩 또는 찜 여부 로딩) */
    isLoading: isAuthLoading || (!!user && isWishlistLoading),
    /** 찜 토글 중 */
    isToggling: toggleMutation.isPending,
    /** 에러 */
    error,
    /** 찜하기/찜 취소 토글 */
    handleToggle,
  };
}
