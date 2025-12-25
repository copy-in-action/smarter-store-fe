import type { Metadata } from "next";
import { PAGES } from "@/shared/constants";
import { EmailVerificationView } from "@/views/service/auth";

/**
 * 회원가입 3단계 - 이메일 인증 페이지
 */
export default function EmailVerificationPage() {
  return <EmailVerificationView />;
}

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata =
  PAGES.AUTH.SIGNUP.EMAIL.EMAIL_VERIFICATION.metadata;
