import { User } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 마이페이지 버튼 컴포넌트
 */
export function MyButton() {
  return (
    <Button
      variant="ghost"
      className="h-full md:flex-col md:gap-0 md:h-[73px] md:justify-between md:min-w-20"
    >
      <User className="stroke-[1.5px] size-5 md:size-7" />
      <div className="hidden font-bold tracking-tighter md:block">마이</div>
    </Button>
  );
}
