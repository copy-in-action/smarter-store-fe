/**
 * 인증 관련 순수 API 함수들
 * 데이터 변환 로직을 포함한 비즈니스 로직
 */

import type { ApiResultResponse } from "@/shared/api";
import {
  confirmOtp,
  login,
  refresh,
  requestEmailVerification,
  signup,
} from "@/shared/api/orval/auth/auth";
import type {
  EmailVerificationRequest,
  LoginRequest,
  OtpConfirmationRequest,
  RefreshTokenRequest,
  SignupRequest,
  UserResponse,
} from "@/shared/api/orval/types";

/**
 * 이메일 로그인 API
 * @param loginData - 로그인 요청 데이터
 * @returns 사용자 정보
 */
export const loginUser = async (
  loginData: LoginRequest,
): Promise<UserResponse> => {
  const response = await login(loginData);
  return response.data as UserResponse;
};

/**
 * 회원가입 API
 * @param signupData - 회원가입 요청 데이터
 * @returns 사용자 정보
 */
export const signupUser = async (
  signupData: SignupRequest,
): Promise<UserResponse> => {
  const response = await signup(signupData);
  return response.data as UserResponse;
};

/**
 * 토큰 갱신 API
 * @param refreshData - 리프레시 토큰 요청 데이터
 * @returns 갱신 성공 결과
 */
export const refreshUserToken = async (
  refreshData: RefreshTokenRequest,
): Promise<ApiResultResponse> => {
  await refresh(refreshData);
  return { result: true };
};

/**
 * 이메일 인증 요청 API
 * @param email - 인증을 요청할 이메일 주소
 * @returns 인증 요청 응답
 */
export const requestUserEmailVerification = async (email: string) => {
  const request: EmailVerificationRequest = { email };
  const response = await requestEmailVerification(request);
  return response.data;
};

/**
 * 이메일 인증 코드 확인 API
 * @param confirmData - 이메일 + 인증코드
 * @returns 인증 확인 응답
 */
export const confirmUserEmailVerification = async (
  confirmData: OtpConfirmationRequest,
) => {
  const response = await confirmOtp(confirmData);
  return response.data;
};
