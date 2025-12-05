import { User } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 마이페이지 버튼 컴포넌트
 */
export function MyButton() {
  return (
    <Button
      variant="ghost"
      className="flex-col justify-between h-full gap-2.5 min-w-[75px]"
    >
      <User className="stroke-[1.5px] size-7" />
      <div className="hidden font-bold tracking-tighter md:block">마이</div>
    </Button>
  );
}
