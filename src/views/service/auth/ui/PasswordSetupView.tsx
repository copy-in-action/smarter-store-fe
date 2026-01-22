"use client";
import {
  PasswordSetupForm,
  SignupStep,
  useSignupProgressGuard,
} from "@/features/service/auth";
import { AuthTitle } from "./AuthTitle";

/**
 * 비밀번호 설정 페이지 뷰 (회원가입 4단계 - 최종)
 * 계정에 사용할 비밀번호를 설정합니다
 */
export function PasswordSetupView() {
  // 진행상황 체크 - 1,2단계 데이터가 없으면 첫 페이지로 리다이렉트
  useSignupProgressGuard(SignupStep.PASSWORD_SETUP);

  return (
    <div className="auth-wrapper sm:mb-[120px]">
      <AuthTitle>
        로그인에 사용할
        <br />
        비밀번호를 설정해 주세요
      </AuthTitle>

      <PasswordSetupForm />
    </div>
  );
}
