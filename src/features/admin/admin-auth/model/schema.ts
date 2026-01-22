import { z } from "zod";

/**
 * 관리자 로그인 폼 검증 스키마
 * orval의 AdminLoginRequest와 호환되는 폼 검증 로직
 */
export const adminLoginFormSchema = z.object({
  /** 로그인 ID */
  loginId: z
    .string()
    .min(1, "로그인 ID를 입력해주세요")
    .min(3, "로그인 ID는 3자 이상이어야 합니다")
    .max(50, "로그인 ID는 50자 이하여야 합니다")
    .trim(),

  /** 비밀번호 */
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(4, "비밀번호는 4자 이상이어야 합니다")
    .max(20, "비밀번호는 100자 이하여야 합니다"),
});

/**
 * 관리자 로그인 폼 데이터 타입
 * AdminLoginRequest와 동일한 구조를 가짐
 */
export type AdminLoginFormData = z.infer<typeof adminLoginFormSchema>;
