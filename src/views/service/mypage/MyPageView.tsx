import { Calendar, Heart, Ticket, User } from "lucide-react";
import Link from "next/link";
import { PAGES } from "@/shared/config/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

/**
 * 마이페이지 메뉴 아이템
 */
interface MyPageMenuItem {
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 아이콘 */
  icon: React.ReactNode;
  /** 링크 경로 */
  href: string;
}

/**
 * 마이페이지 메인 뷰
 */
export default function MyPageView() {
  /**
   * 마이페이지 메뉴 항목들
   */
  const menuItems: MyPageMenuItem[] = [
    {
      title: "예매 내역",
      description: "공연 예매 내역을 확인하고 관리하세요",
      icon: <Ticket className="w-8 h-8" />,
      href: PAGES.MY.BOOKINGS.LIST.path,
    },
    {
      title: "찜 목록",
      description: "관심 있는 공연들을 모아보세요",
      icon: <Heart className="w-8 h-8" />,
      href: PAGES.WISHLIST.path,
    },
    {
      title: "회원 정보",
      description: "내 정보를 확인하고 수정하세요",
      icon: <User className="w-8 h-8" />,
      href: "/mypage/profile",
    },
    {
      title: "최근 본 공연",
      description: "최근에 둘러본 공연들을 다시 확인하세요",
      icon: <Calendar className="w-8 h-8" />,
      href: "/mypage/recent",
    },
  ];

  return (
    <div className="wrapper mt-4 pb-4">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          마이페이지
        </h1>{" "}
        <p className="text-muted-foreground text-sm mt-2">
          내 정보를 확인 및 수정 할 수 있습니다.
        </p>
      </div>

      {/* 메뉴 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 py-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-all hover:shadow-lg cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <CardTitle className="sm:text-xl">{item.title}</CardTitle>
                    <CardDescription className="sm:text-base">
                      {item.description}
                    </CardDescription>
                  </div>
                  <div className="text-primary opacity-70">{item.icon}</div>
                </div>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 추가 정보 카드 */}
      <div className="space-y-1 mt-6">
        <p className="text-sm text-muted-foreground">
          • 예매 후 2분 이내 결제하지 않으면 자동으로 취소됩니다.
        </p>
        <p className="text-sm text-muted-foreground">
          • 공연 시작 전까지 예매를 취소할 수 있습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          • 찜 목록에 추가하면 공연 정보를 빠르게 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
