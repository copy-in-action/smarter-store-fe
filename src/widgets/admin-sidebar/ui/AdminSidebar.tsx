"use client";

import { usePathname } from "next/navigation";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/shared/ui/sidebar";
import { getActiveSidebarData } from "../lib/sidebarData";
import type { SidebarData } from "../model/types";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";

/**
 * 관리자 사이드바 컴포넌트 속성
 */
interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** 사이드바 데이터 (선택사항, 기본값 사용) */
  data?: SidebarData;
}

/**
 * 관리자 사이드바 컴포넌트
 * 관리자 페이지의 메인 네비게이션을 제공합니다
 */
export function AdminSidebar({ data, ...props }: AdminSidebarProps) {
  const pathname = usePathname();

  // 현재 경로를 기반으로 활성 상태가 적용된 사이드바 데이터 생성
  const activeSidebarData = data || getActiveSidebarData(pathname);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={activeSidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={activeSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
