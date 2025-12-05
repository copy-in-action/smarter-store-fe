"use client";

import { Heart, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type {
  BottomNavigationItem,
  BottomNavigationProps,
} from "../model/types";

/**
 * Bottom Navigation에서 사용할 기본 메뉴 항목들
 */
const navigationItems: BottomNavigationItem[] = [
  {
    id: "home",
    label: "홈",
    href: "/",
    icon: Home,
  },
  {
    id: "like",
    label: "찜",
    href: "/wishlist",
    icon: Heart,
  },
  {
    id: "my",
    label: "마이",
    href: "/my",
    icon: User,
  },
];

/**
 * md 이하 화면에서 사용되는 하단 네비게이션 바 컴포넌트
 * 홈, 찜, 마이 메뉴를 제공합니다
 */
export function BottomNavigation({
  activeItemId,
  className,
}: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background border-t border-border",
        "px-4",
        "sm:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItemId
            ? item.id === activeItemId
            : pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg",
                "text-xs font-medium transition-colors",
                "min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-6", isActive ? "stroke-2" : "stroke-[1.5]")}
              />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
