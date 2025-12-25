"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signupUser } from "@/entities/auth";
import type { SignupRequest } from "@/shared/api/orval/types";

/**
 * 이메일 인증 요청 훅
 * 이메일 인증 메일 발송을 처리합니다
 */
export const useSignupEmail = () => {
  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      toast.success("회원가입이 완료 되었습니다.");
    },
    onError: (error: Error) => {
      console.error("이메일 회원가입 실패:", error);

      // 에러 메시지에 따른 처리
      if (error.message.includes("409")) {
        toast.error("이미 인증된 이메일입니다.");
      } else {
        toast.error("회원가입에 실패하였습니다. 다시 시도해주세요.");
      }
    },
  });

  /**
   * 이메일 인증 확인 실행 함수
   * @param token - 이메일로 받은 인증 토큰
   */
  const emailSignup = async (signupRequest: SignupRequest) => {
    await signupMutation.mutateAsync(signupRequest);
  };

  return {
    emailSignup,
    isLoading: signupMutation.isPending,
    isError: signupMutation.isError,
    error: signupMutation.error,
    isSuccess: signupMutation.isSuccess,
  };
};
