import { AuthHeader } from "@/widgets/auth-header";

/**
 * 인증 페이지용 레이아웃 컴포넌트
 * AuthHeader를 사용하여 일반 헤더와 다른 디자인을 적용합니다
 */
export function AuthLayout({
  children,
}: {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      <main>{children}</main>
    </>
  );
}
