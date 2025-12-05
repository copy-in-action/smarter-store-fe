import { Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 최근 본 상품 버튼 컴포넌트
 */
export function RecentViewButton() {
  return (
    <Button
      variant="ghost"
      className="flex-col justify-between h-full gap-2.5 min-w-[75px]"
    >
      <Clock className="stroke-[1.5px] size-7" />
      <div className="hidden font-bold tracking-tighter md:block">
        최근 본 상품
      </div>
    </Button>
  );
}
