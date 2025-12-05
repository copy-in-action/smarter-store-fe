import { cn } from "@/shared/lib/utils";
import { CartButton } from "./CartButton";
import { LikeButton } from "./LikeButton";
import { Logo } from "./Logo";
import { MyButton } from "./MyButton";
import { RecentViewButton } from "./RecentViewButton";
import { SearchInput } from "./SearchInput";

/**
 * 헤더 컴포넌트
 */
export function Header() {
  return (
    <header className="sticky top-0">
      <div
        className={cn(
          "w-full bg-background flex flex-col items-center justify-center pt-6 mx-none wrapper",
          "md:flex-row md:h-[100px] md:pt-0",
        )}
      >
        <div
          className={cn(
            "relative flex justify-center w-full mb-3",
            "md:w-auto md:mb-0",
          )}
        >
          <Logo />
          <span className="absolute right-0 mb-2 md:hidden">
            <CartButton />
          </span>
        </div>
        <div className={cn("w-full h-10", "md:max-w-xl md:h-14 md:ms-6")}>
          <SearchInput />
        </div>
        <div className={cn("hidden ps-2 ms-auto", "md:gap-2 md:flex")}>
          <MyButton />
          <LikeButton />
          <CartButton />
          <RecentViewButton />
        </div>
      </div>
      <div
        className={cn(
          "bg-gradient-to-r from-purple-500 via-blue-600 via-blue-500 to-sky-400 h-[1px] hidden",
          "md:block",
        )}
      ></div>
    </header>
  );
}
