import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * 장바구니 버튼 컴포넌트
 */
export function CartButton() {
  return (
    <Button
      variant="ghost"
      className="h-full md:flex-col md:gap-2.5 gap-0 md:justify-between md:min-w-[75px]"
    >
      <ShoppingCart className="stroke-[1.5px] size-5 md:size-7" />
      <div className="hidden font-bold tracking-tighter md:block">장바구니</div>
    </Button>
  );
}
