import { EmailInputForm } from "@/features/auth";
import { AuthTitle } from "./AuthTitle";

/**
 * 이메일 입력 페이지 뷰 (회원가입 2단계)
 * 로그인에 사용할 이메일을 입력받습니다
 */
export function EmailSignupView() {
  return (
    <div className="auth-wrapper sm:mb-[120px]">
      <AuthTitle>
        로그인에 사용할
        <br />
        이메일을 입력해주세요
      </AuthTitle>

      <EmailInputForm />
    </div>
  );
}