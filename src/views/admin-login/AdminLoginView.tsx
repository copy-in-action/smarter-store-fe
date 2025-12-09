import { AdminLoginForm } from "@/features/admin-auth";

/**
 * 관리자 로그인 페이지 뷰
 * 관리자 로그인 폼을 중앙에 배치한 페이지 레이아웃을 제공합니다
 */
export default function AdminLoginView() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <AdminLoginForm />
    </div>
  );
}
