/**
 * 홈 태그 순서 관리 페이지
 * Next.js App Router 페이지 파일
 */

import type { Metadata } from "next";
import { PAGES } from "@/shared/config";
import { HomeTagOrderView } from "@/views/admin/home-tag-order";

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = PAGES.ADMIN.HOME.TAG_ORDER.metadata;

/**
 * 홈 태그 순서 관리 페이지
 */
export default function HomeTagOrderPage() {
  return <HomeTagOrderView />;
}
