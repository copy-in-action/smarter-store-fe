import Link from "next/link";
import { PAGES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/ui/Logo";
import { BookingPageWrapper } from "./BookingPageWrapper";
import { CartButton } from "./CartButton";
import { MyButton } from "./MyButton";
import { RecentViewButton } from "./RecentViewButton";
import { SearchInput } from "./SearchInput";
import { WishListButton } from "./WishListButton";

/**
 * 메인 헤더 컴포넌트
 * 로고, 검색창, 마이페이지, 좋아요, 장바구니 등의 주요 네비게이션 요소를 포함합니다.
 * 스티키 상단 바 형태로 표시됩니다.
 * @returns 헤더 UI
 */
export function Header() {
  return (
    <header className="sticky z-50 sm:top-0 -top-2">
      <div
        className={cn(
          "w-full bg-background flex flex-col items-center justify-center pt-6 pb-2 mx-none wrapper",
          "sm:flex-row sm:h-[100px] sm:py-0",
        )}
      >
        <div
          className={cn(
            "relative flex justify-center w-full mb-3",
            "sm:w-auto sm:mb-0",
          )}
        >
          <Link href={PAGES.HOME.path}>
            <Logo />
          </Link>
          <span className="absolute right-0 mb-2 sm:hidden">
            <BookingPageWrapper>
              <CartButton />
            </BookingPageWrapper>
          </span>
        </div>
        <BookingPageWrapper>
          <div className={cn("h-10", "sm:max-w-xl sm:h-14 sm:ms-6 sm:me-4")}>
            <SearchInput />
          </div>
        </BookingPageWrapper>
        <BookingPageWrapper>
          <div
            className={cn(
              "hidden ps-2 ms-auto",
              "sm:gap-2 sm:flex sm:justify-end",
            )}
          >
            <MyButton />
            <WishListButton />
            <CartButton />
            <RecentViewButton />
          </div>
        </BookingPageWrapper>
      </div>
      <div
        className={
          "bg-gradient-to-r from-purple-500 via-blue-600 via-blue-500 to-sky-400 h-[1px]"
        }
      ></div>
    </header>
  );
}
