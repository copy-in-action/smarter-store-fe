import { PhoneVerificationForm } from "@/features/service/auth";
import { AuthTitle } from "./AuthTitle";

/**
 * 휴대폰 번호 인증 페이지 뷰 (회원가입 1단계)
 * 이름과 휴대폰 번호를 입력받습니다
 */
export function PhoneVerificationView() {
  return (
    <div className="auth-wrapper sm:mb-[120px]">
      <AuthTitle>
        이름과 휴대폰 번호를
        <br />
        입력해주세요
      </AuthTitle>

      <PhoneVerificationForm />
    </div>
  );
}
