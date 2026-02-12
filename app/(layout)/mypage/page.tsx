import type { Metadata } from "next";
import { PAGES } from "@/shared/config/routes";
import { MyPageView } from "@/views/service/mypage";

export const metadata: Metadata = PAGES.MY.metadata;

/**
 * 마이페이지 메인
 */
export default function MyPage() {
  return <MyPageView />;
}
