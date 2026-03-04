/**
 * 공연 찜하기 버튼 컴포넌트
 */

"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/shared/ui/skeleton";
import { usePerformanceWishlist } from "../model/usePerformanceWishlist";

/**
 * 공연 찜하기 버튼 Props
 */
interface PerformanceWishlistButtonProps {
  /** 공연 ID */
  performanceId: number;
}

/**
 * 공연 찜하기 버튼
 * - 비로그인 시: 클릭하면 로그인 페이지로 리다이렉트
 * - 로그인 시: 찜하기/찜 취소 토글 (Optimistic Updates)
 */
export function PerformanceWishlistButton({
  performanceId,
}: PerformanceWishlistButtonProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isWishlisted,
    isLoading,
    isToggling,
    handleToggle,
  } = usePerformanceWishlist(performanceId);

  /**
   * 버튼 클릭 핸들러
   * 비로그인 시 로그인 페이지로 리다이렉트
   */
  const handleClick = () => {
    if (!isAuthenticated) {
      // 현재 경로를 redirect 파라미터로 전달
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    handleToggle();
  };

  // 로딩 중 Skeleton (CLS 방지를 위한 고정 크기)
  if (isLoading) {
    return (
      <div className="h-10 w-10">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isToggling}
      className="group relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isWishlisted ? "찜 취소" : "찜하기"}
      title={
        !isAuthenticated
          ? "로그인이 필요합니다"
          : isWishlisted
            ? "찜 취소"
            : "찜하기"
      }
    >
      <Heart
        className={`w-6 h-6 transition-all ${
          isWishlisted
            ? "fill-red-500 text-red-500"
            : "text-gray-400 group-hover:text-gray-600"
        } ${isToggling ? "scale-110" : ""}`}
      />
    </button>
  );
}
