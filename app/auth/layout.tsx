import { AuthLayout } from "@/widgets/auth-layout";

/**
 * 인증 페이지 레이아웃
 * @param children - 자식 컴포넌트
 */
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
