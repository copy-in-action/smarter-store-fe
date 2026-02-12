import type { Metadata } from "next";
import { PAGES } from "@/shared/config/routes";
import { MyBookingsListView } from "@/views/service/mypage";

export const metadata: Metadata = PAGES.MY.BOOKINGS.LIST.metadata;

/**
 * 마이페이지 예매 내역 리스트 페이지
 */
export default function MyBookingsPage() {
  return <MyBookingsListView />;
}
