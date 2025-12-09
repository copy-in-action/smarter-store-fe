import type { Metadata } from "next";
import { PhoneVerificationView } from "@/views/auth";
import { PAGES } from "@/shared/constants";

/**
 * 회원가입 1단계 - 이름과 휴대폰 번호 입력 페이지
 */
export default function OccupancyVerificationPage() {
  return <PhoneVerificationView />;
}

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = PAGES.AUTH.SIGNUP.EMAIL.OCCUPANCY_VERIFICATION.metadata;