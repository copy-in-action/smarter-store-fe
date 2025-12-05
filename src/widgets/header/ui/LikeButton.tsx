import { Heart } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 찜하기 버튼 컴포넌트
 */
export function LikeButton() {
  return (
    <Button
      variant="ghost"
      className="flex-col justify-between h-full gap-2.5 min-w-[75px]"
    >
      <Heart className="stroke-[1.5px] size-7" />
      <div className="hidden font-bold tracking-tighter sm:block">찜</div>
    </Button>
  );
}
