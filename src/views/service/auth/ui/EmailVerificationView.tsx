"use client";

import { useState } from "react";
import {
  EmailInputForm,
  EmailVerificationForm,
  SignupStep,
} from "@/features/service/auth";
import { useSignupProgressGuard } from "@/features/service/auth/lib/useSignupProgressGuard";
import { AuthTitle } from "./AuthTitle";

/**
 * 이메일 인증 페이지 뷰 (회원가입 3단계)
 * 2단계(이메일 입력)와 3단계(이메일 인증)를 하나의 페이지에서 처리합니다
 */
export function EmailVerificationView() {
  const [currentStep, setCurrentStep] = useState<"input" | "verification">(
    "input",
  );
  // 진행상황 체크 - 1단계 데이터가 없으면 첫 페이지로 리다이렉트
  useSignupProgressGuard(SignupStep.EMAIL_INPUT);

  /**
   * 이메일 입력 완료 후 인증 단계로 전환
   */
  const handleEmailSubmit = () => {
    setCurrentStep("verification");
  };

  /**
   * 이메일 입력 단계 렌더링
   */
  const renderEmailInput = () => (
    <>
      <AuthTitle>
        로그인에 사용할
        <br />
        이메일을 입력해주세요
      </AuthTitle>
      <EmailInputForm onNext={handleEmailSubmit} />
    </>
  );

  /**
   * 이메일 인증 단계 렌더링
   */
  const renderEmailVerification = () => (
    <>
      <AuthTitle>
        이메일로 받은
        <br />
        인증번호를 입력해주세요
      </AuthTitle>
      <EmailVerificationForm />
    </>
  );

  return (
    <div className="auth-wrapper sm:mb-[120px]">
      {currentStep === "input" ? renderEmailInput() : renderEmailVerification()}
    </div>
  );
}
