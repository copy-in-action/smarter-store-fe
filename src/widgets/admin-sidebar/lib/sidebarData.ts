import {
  BarChart3,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { SidebarData } from "../model/types";

/**
 * 관리자 사이드바 기본 데이터
 */
export const adminSidebarData: SidebarData = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "대시보드",
      url: "/admin",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "공연",
      url: "/admin/products",
      icon: Package,
      items: [
        {
          title: "공연 리스트",
          url: "/admin/products",
        },
        {
          title: "공연 추가",
          url: "/admin/products/new",
        },
      ],
    },
    {
      title: "공연장",
      url: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "사용자 관리",
      url: "/admin/users",
      icon: Users,
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
