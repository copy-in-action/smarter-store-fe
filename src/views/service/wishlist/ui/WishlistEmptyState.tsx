/**
 * 찜 목록 빈 상태 컴포넌트
 */

import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

/**
 * 찜한 공연이 없을 때 표시되는 빈 상태 UI
 */
export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md space-y-6 text-center">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Heart className="text-gray-400 size-6 sm:size-12" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">
            찜한 공연이 없습니다
          </h2>
          <p className="text-gray-600">
            관심 있는 공연을 찜해보세요
            <br />
            나중에 쉽게 찾아볼 수 있습니다
          </p>
        </div>

        {/* 공연 둘러보기 버튼 */}
        <div>
          <Button asChild size="lg">
            <Link href="/">공연 둘러보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
