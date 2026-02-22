import { PAGES } from "@/shared/config";
import { NoticeListView } from "@/views/admin/notice/list";

export const metadata = PAGES.ADMIN.NOTICES.LIST.metadata;

/**
 * 공지사항 리스트 페이지 (Admin)
 */
export default function NoticeListPage() {
  return <NoticeListView />;
}
