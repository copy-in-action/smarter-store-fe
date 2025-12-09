import type { LucideIcon } from "lucide-react";

/**
 * 사이드바 메뉴 아이템 타입
 */
export interface AdminSidebarMenuItem {
  /** 메뉴 제목 */
  title: string;
  /** 메뉴 URL */
  url: string;
  /** 메뉴 아이콘 */
  icon?: LucideIcon;
  /** 활성 상태 */
  isActive?: boolean;
  /** 하위 메뉴 아이템들 */
  items?: {
    /** 하위 메뉴 제목 */
    title: string;
    /** 하위 메뉴 URL */
    url: string;
  }[];
}

/**
 * 사용자 정보 타입
 */
export interface SidebarUser {
  /** 사용자 이름 */
  name: string;
  /** 사용자 이메일 */
  email: string;
  /** 아바타 이미지 URL */
  avatar: string;
}

/**
 * 사이드바 데이터 타입
 */
export interface SidebarData {
  /** 사용자 정보 */
  user: SidebarUser;
  /** 메인 네비게이션 메뉴들 */
  navMain: AdminSidebarMenuItem[];
}
