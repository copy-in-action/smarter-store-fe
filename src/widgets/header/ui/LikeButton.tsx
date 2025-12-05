import { Heart } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 찜하기 버튼 컴포넌트
 */
export function LikeButton() {
  return (
    <Button
      variant="ghost"
      className="h-full md:flex-col md:gap-0 md:h-[73px] md:justify-between md:min-w-20"
    >
      <Heart className="stroke-[1.5px] size-5 md:size-7" />
      <div className="hidden font-bold tracking-tighter md:block">찜</div>
    </Button>
  );
}
