/**
 * Auth Entity Public API
 * FSD 구조에 따른 인증 엔티티 export
 */

// 타입들
export type {
  EmailInputData,
  EmailVerificationData,
  ErrorResponseData,
  LoginRequestData,
  PasswordSetupData,
  PhoneVerificationData,
  RefreshTokenRequestData,
  SignupRequestData,
  SignupWithConfirmData,
  TokenResponseData,
  UserResponseData,
} from "./model/auth.schema";

// Zod 스키마들
export {
  emailInputSchema,
  emailVerificationSchema,
  errorResponseSchema,
  loginRequestSchema,
  passwordSetupSchema,
  phoneVerificationSchema,
  refreshTokenRequestSchema,
  signupRequestSchema,
  signupWithConfirmSchema,
  tokenResponseSchema,
  userResponseSchema,
} from "./model/auth.schema";

// API 함수들
export {
  requestEmailVerificationApi,
  confirmEmailVerificationApi,
} from "./api/emailVerification.api";
