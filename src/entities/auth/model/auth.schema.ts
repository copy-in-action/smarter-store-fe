import { z } from "zod";

/**
 * 로그인 요청 스키마
 * 클라이언트 폼 검증용
 */
export const loginRequestSchema = z.object({
  /** 이메일 주소 */
  email: z
    .email("올바른 이메일 형식이 아닙니다")
    .min(1, "이메일을 입력해주세요"),
  /** 비밀번호 */
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(8, "비밀번호는 8자 이상이어야 합니다"),
});

/**
 * 회원가입 요청 스키마
 * 클라이언트 폼 검증용
 */
export const signupRequestSchema = z.object({
  /** 이메일 주소 */
  email: z
    .email("올바른 이메일 형식이 아닙니다")
    .min(1, "이메일을 입력해주세요"),
  /** 사용자 이름 */
  username: z
    .string()
    .min(1, "사용자 이름을 입력해주세요")
    .min(2, "사용자 이름은 2자 이상이어야 합니다")
    .max(20, "사용자 이름은 20자 이하여야 합니다")
    .regex(
      /^[a-zA-Z0-9가-힣_]+$/,
      "사용자 이름은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다",
    ),
  /** 비밀번호 */
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(8, "비밀번호는 8자 이상이어야 합니다"),
  /*  .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다",
    ), */
});

/**
 * 비밀번호 확인을 포함한 회원가입 스키마
 * 폼 컴포넌트에서 사용
 */
export const signupWithConfirmSchema = signupRequestSchema
  .extend({
    /** 비밀번호 확인 */
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * 리프레시 토큰 요청 스키마
 */
export const refreshTokenRequestSchema = z.object({
  /** 리프레시 토큰 */
  refreshToken: z.string().min(1, "리프레시 토큰이 필요합니다"),
});

/**
 * 토큰 응답 스키마
 */
export const tokenResponseSchema = z.object({
  /** JWT 액세스 토큰 */
  accessToken: z.string().min(1, "액세스 토큰이 필요합니다"),
  /** 리프레시 토큰 */
  refreshToken: z.string().min(1, "리프레시 토큰이 필요합니다"),
  /** 액세스 토큰 만료 시간 (초) */
  expiresIn: z.number().positive("만료 시간은 양수여야 합니다"),
});

/**
 * 사용자 응답 스키마
 */
export const userResponseSchema = z.object({
  /** 사용자 ID */
  id: z.string().min(1, "사용자 ID가 필요합니다"),
  /** 이메일 */
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  /** 사용자 이름 */
  username: z.string().min(1, "사용자 이름이 필요합니다"),
  /** 생성 일시 */
  createdAt: z.string().datetime("올바른 날짜 형식이 아닙니다"),
  /** 수정 일시 */
  updatedAt: z.string().datetime("올바른 날짜 형식이 아닙니다"),
});

/**
 * 에러 응답 스키마
 */
export const errorResponseSchema = z.object({
  /** 에러 메시지 */
  message: z.string().min(1, "에러 메시지가 필요합니다"),
  /** 에러 코드 (선택적) */
  code: z.string().optional(),
  /** HTTP 상태 코드 */
  status: z.number().min(100).max(599),
});

/**
 * 휴대폰 번호와 이름 입력 스키마 (1단계)
 */
export const phoneVerificationSchema = z.object({
  /** 사용자 이름 */
  username: z
    .string()
    .min(1, "이름을 입력해주세요")
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(20, "이름은 20자 이하여야 합니다")
    .regex(
      /^[가-힣a-zA-Z\s]+$/,
      "이름은 한글 또는 영문만 입력 가능합니다",
    ),
  /** 휴대폰 번호 */
  phoneNumber: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요")
    .regex(
      /^(01[016789])-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 휴대폰 번호 형식이 아닙니다",
    ),
});

/**
 * 이메일 입력 스키마 (2단계)
 */
export const emailInputSchema = z.object({
  /** 이메일 주소 */
  email: z
    .email("올바른 이메일 형식이 아닙니다")
    .min(1, "이메일을 입력해주세요"),
});

/**
 * 이메일 인증 코드 입력 스키마 (3단계)
 */
export const emailVerificationSchema = z.object({
  /** 인증 코드 (6자리 숫자) */
  verificationCode: z
    .string()
    .min(1, "인증번호를 입력해주세요")
    .length(6, "인증번호는 6자리입니다")
    .regex(/^[0-9]+$/, "인증번호는 숫자만 입력 가능합니다"),
});

/**
 * 비밀번호 설정 스키마 (4단계)
 */
export const passwordSetupSchema = z
  .object({
    /** 비밀번호 */
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다"),
    /** 비밀번호 확인 */
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * 타입 정의들
 */
export type LoginRequestData = z.infer<typeof loginRequestSchema>;
export type SignupRequestData = z.infer<typeof signupRequestSchema>;
export type SignupWithConfirmData = z.infer<typeof signupWithConfirmSchema>;
export type PhoneVerificationData = z.infer<typeof phoneVerificationSchema>;
export type EmailInputData = z.infer<typeof emailInputSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type PasswordSetupData = z.infer<typeof passwordSetupSchema>;
export type RefreshTokenRequestData = z.infer<typeof refreshTokenRequestSchema>;
export type TokenResponseData = z.infer<typeof tokenResponseSchema>;
export type UserResponseData = z.infer<typeof userResponseSchema>;
export type ErrorResponseData = z.infer<typeof errorResponseSchema>;
