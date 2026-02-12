"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 마이페이지 버튼 컴포넌트
 */
export function MyButton() {
  const router = useRouter();
  const handleGoToMyPage = () => {
    router.push(PAGES.MY.path);
  };
  return (
    <Button
      onClick={handleGoToMyPage}
      variant="ghost"
      className="flex-col justify-between h-full gap-2.5 min-w-[75px]"
    >
      <User className="stroke-[1.5px] size-7" />
      <div className="hidden font-bold tracking-tighter sm:block">마이</div>
    </Button>
  );
}
