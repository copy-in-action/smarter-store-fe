import { PAGES } from "@/shared/config";
import { NoticeCreateView } from "@/views/admin/notice/create";

export const metadata = PAGES.ADMIN.NOTICES.CREATE.metadata;

/**
 * 공지사항 등록 페이지 (Admin)
 */
export default function NoticeCreatePage() {
  return <NoticeCreateView />;
}
