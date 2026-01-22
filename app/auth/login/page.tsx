import { LoginView } from "@/views/service/auth";

/**
 * 로그인 페이지
 * @param searchParams - URL 쿼리 파라미터 (redirect 포함)
 */
const page = async ({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) => {
  const { redirect } = await searchParams;
  return <LoginView redirectUrl={redirect} />;
};

export default page;
