import type { Metadata } from "next";
import { PAGES } from "@/shared/constants";
import { PasswordSetupView } from "@/views/service/auth";

/**
 * 회원가입 4단계 - 비밀번호 설정 페이지 (최종 단계)
 */
export default function PasswordConfirmPage() {
  return <PasswordSetupView />;
}

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata =
  PAGES.AUTH.SIGNUP.EMAIL.PASSWORD_CONFIRM.metadata;
