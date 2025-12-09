"use client";

import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/shared/ui/sidebar";
import { adminSidebarData } from "../lib/sidebarData";
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
export function AdminSidebar({
  data = adminSidebarData,
  ...props
}: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
