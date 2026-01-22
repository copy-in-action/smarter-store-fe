import { PAGES } from "@/shared/config/routes";
import { AdminLoginView } from "@/views/admin/admin-login";

/**
 * 관리자 로그인 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.AUTH.LOGIN.metadata;

/**
 * 관리자 로그인 페이지
 * Next.js App Router를 사용하여 /admin/login 경로에 매핑됩니다
 */
export default function AdminLoginPage() {
  return <AdminLoginView />;
}
