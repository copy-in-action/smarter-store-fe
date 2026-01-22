"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 찜하기 버튼 컴포넌트
 */
export function LikeButton() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        isAuthenticated
          ? router.push(PAGES.MY.LIKES.path)
          : router.push(PAGES.AUTH.LOGIN.path);
      }}
      variant="ghost"
      className="flex-col justify-between h-full gap-2.5 min-w-[75px]"
    >
      <Heart className="stroke-[1.5px] size-7" />
      <div className="hidden font-bold tracking-tighter sm:block">찜</div>
    </Button>
  );
}
