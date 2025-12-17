import Link from "next/link";
import { EmailLoginForm } from "@/features/auth";
import { PAGES } from "@/shared/constants";
import { AuthTitle } from "./AuthTitle";

/**
 * 이메일 로그인 페이지 뷰 속성
 */
interface EmailLoginViewProps {
  /** 로그인 후 리다이렉트할 URL */
  redirectUrl?: string;
}

/**
 * 이메일 로그인 페이지 뷰
 * 레이아웃과 네비게이션 링크를 제공합니다
 */
export function EmailLoginView({ redirectUrl }: EmailLoginViewProps) {
  return (
    <div className="auth-wrapper sm:mb-[120px]">
      <AuthTitle>
        이메일로
        <br />
        로그인 해주세요
      </AuthTitle>

      <EmailLoginForm redirectUrl={redirectUrl} />

      <div className="mt-5 space-y-2 text-sm text-center">
        <Link href={PAGES.AUTH.FORGOT_ID.path} className="underline">
          아이디 찾기
        </Link>
        <span className="mx-5">ǀ</span>
        <Link href={PAGES.AUTH.FORGOT_PASSWORD.path} className="underline">
          비밀번호 재설정
        </Link>
      </div>
    </div>
  );
}
