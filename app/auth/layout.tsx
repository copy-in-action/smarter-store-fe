import { AuthHeader } from "@/widgets/auth-header";

/**
 * 인증 페이지 레이아웃
 * AuthHeader를 사용하여 일반 헤더와 다른 디자인을 적용합니다
 * @param children - 자식 컴포넌트
 */
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      <main>{children}</main>
    </>
  );
}
