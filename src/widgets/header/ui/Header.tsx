import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/ui/Logo";
import { CartButton } from "./CartButton";
import { LikeButton } from "./LikeButton";
import { MyButton } from "./MyButton";
import { RecentViewButton } from "./RecentViewButton";
import { SearchInput } from "./SearchInput";

/**
 * 헤더 컴포넌트
 */
export function Header() {
  return (
    <header className="sticky top-[-20px]">
      <div
        className={cn(
          "w-full bg-background flex flex-col items-center justify-center pt-6 mx-none wrapper",
          "sm:flex-row sm:h-[100px] sm:pt-0",
        )}
      >
        <div
          className={cn(
            "relative flex justify-center w-full mb-3",
            "sm:w-auto sm:mb-0",
          )}
        >
          <Logo />
          <span className="absolute right-0 mb-2 sm:hidden">
            <CartButton />
          </span>
        </div>
        <div className={cn("w-full h-10", "sm:max-w-xl sm:h-14 sm:ms-6")}>
          <SearchInput />
        </div>
        <div className={cn("hidden ps-2 ms-auto", "sm:gap-2 sm:flex")}>
          <MyButton />
          <LikeButton />
          <CartButton />
          <RecentViewButton />
        </div>
      </div>
      <div
        className={cn(
          "bg-gradient-to-r from-purple-500 via-blue-600 via-blue-500 to-sky-400 h-[1px] hidden",
          "sm:block",
        )}
      ></div>
    </header>
  );
}
