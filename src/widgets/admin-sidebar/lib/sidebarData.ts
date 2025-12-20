import { BarChart3, Music, Settings, ShoppingCart, Users } from "lucide-react";
import { PAGES } from "@/shared/constants";
import type { SidebarData } from "../model/types";

/**
 * 관리자 사이드바 기본 데이터
 */
export const adminSidebarData: SidebarData = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/images/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "대시보드",
      url: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      title: "공연",
      url: "#",
      icon: Music,
      items: [
        {
          title: "공연 리스트",
          url: PAGES.ADMIN.PERFORMANCES.LIST.path,
        },
        {
          title: "공연 추가",
          url: PAGES.ADMIN.PERFORMANCES.CREATE.path,
        },
      ],
    },
    {
      title: "공연장",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "공연장 추가",
          url: PAGES.ADMIN.VENUES.CREATE.path,
        },
        {
          title: "공연장 리스트",
          url: PAGES.ADMIN.VENUES.LIST.path,
        },
      ],
    },
    {
      title: "기획사/판매자",
      url: "#",
      icon: Users,
      items: [
        {
          title: "기획사/판매자 추가",
          url: PAGES.ADMIN.COMPANY.CREATE.path,
        },
        {
          title: "기획사/판매자 리스트",
          url: PAGES.ADMIN.COMPANY.LIST.path,
        },
      ],
    },
    {
      title: "설정",
      url: "/admin/settings",
      icon: Settings,
      items: [
        {
          title: "일반 설정",
          url: "/admin/settings/general",
        },
        {
          title: "결제 설정",
          url: "/admin/settings/payment",
        },
        {
          title: "알림 설정",
          url: "/admin/settings/notifications",
        },
      ],
    },
  ],
};

/**
 * 현재 경로를 기준으로 활성 상태를 업데이트하는 함수
 * @param pathname - 현재 경로
 * @returns 활성 상태가 적용된 사이드바 데이터
 */
export function getActiveSidebarData(pathname: string): SidebarData {
  const updatedNavMain = adminSidebarData.navMain.map((item) => {
    // 하위 메뉴가 있는 경우
    if (item.items) {
      // 하위 메뉴의 활성 상태 업데이트 (정확한 매칭만)
      const updatedItems = item.items.map((subItem) => ({
        ...subItem,
        isActive: pathname === subItem.url,
      }));

      // 하위 메뉴 중 활성 상태인지 확인
      const hasActiveSubItem = updatedItems.some((subItem) => subItem.isActive);

      return {
        ...item,
        items: updatedItems,
        isActive: hasActiveSubItem,
      };
    }

    // 단일 메뉴인 경우 - 대시보드는 정확히 일치할 때만 활성화
    const isActive =
      item.url === "/admin/dashboard"
        ? pathname === "/admin/dashboard" || pathname === "/admin"
        : pathname === item.url;

    return {
      ...item,
      isActive,
    };
  });

  return {
    ...adminSidebarData,
    navMain: updatedNavMain,
  };
}

/**
 * 사용자 정보를 업데이트하는 함수
 * @param user - 새로운 사용자 정보
 * @returns 업데이트된 사이드바 데이터
 */
export function updateSidebarUser(
  user: Partial<SidebarData["user"]>,
): SidebarData {
  return {
    ...adminSidebarData,
    user: {
      ...adminSidebarData.user,
      ...user,
    },
  };
}
