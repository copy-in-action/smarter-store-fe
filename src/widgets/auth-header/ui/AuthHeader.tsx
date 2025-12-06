import Link from "next/link";
import { PAGES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { BackButton } from "@/shared/ui/BackButton";
import { Logo } from "@/shared/ui/Logo";

/**
 * 인증 페이지용 헤더 컴포넌트
 * 일반 헤더와 달리 검색, 장바구니 등의 기능 없이 간단한 형태
 */
export function AuthHeader() {
  return (
    <header className="sticky top-[-20px] sm:top-0 sm:border-b border-b-gray-100 border-b-0">
      <div
        className={cn(
          "w-full bg-background flex h-[52px] items-center mx-none wrapper",
          "sm:h-[100px]",
        )}
      >
        <Link href={PAGES.HOME.path} className="hidden sm:block">
          <Logo />
        </Link>

        <span className="block sm:hidden">
          <BackButton />
        </span>
      </div>
    </header>
  );
}
