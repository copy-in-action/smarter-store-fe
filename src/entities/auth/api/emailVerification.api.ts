/**
 * 이메일 인증 관련 API
 * orval로 생성된 API 함수들을 엔티티 레벨에서 래핑합니다
 */

import {
  confirmOtp,
  type confirmOtpResponse,
  requestEmailVerification,
  type requestEmailVerificationResponse,
} from "@/shared/api/orval/auth/auth";
import type {
  EmailVerificationRequest,
  OtpConfirmationRequest,
} from "@/shared/api/orval/types";

/**
 * 이메일 인증 요청을 보냅니다
 * @param email - 인증을 요청할 이메일 주소
 * @returns 인증 요청 응답
 */
export async function requestEmailVerificationApi(
  email: string,
): Promise<requestEmailVerificationResponse> {
  const request: EmailVerificationRequest = { email };
  return requestEmailVerification(request);
}

/**
 * 이메일 인증 코드를 확인합니다
 * @param {opt, email} - 이메일 + 인증코드
 * @returns 인증 확인 응답
 */
export async function confirmEmailVerificationApi(
  confirmEmailVerification: OtpConfirmationRequest,
): Promise<confirmOtpResponse> {
  const request: OtpConfirmationRequest = confirmEmailVerification;
  return confirmOtp(request);
}
