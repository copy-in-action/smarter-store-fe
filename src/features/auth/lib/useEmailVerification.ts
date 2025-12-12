import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  confirmEmailVerificationApi,
  requestEmailVerificationApi,
} from "@/entities/auth";

/**
 * 이메일 인증 요청 훅
 * 이메일 인증 메일 발송을 처리합니다
 */
export const useRequestEmailVerification = () => {
  const requestMutation = useMutation({
    mutationFn: requestEmailVerificationApi,
    onSuccess: () => {
      toast.success("인증 이메일을 발송했습니다. 이메일을 확인해주세요.");
    },
    onError: (error: Error) => {
      console.error("이메일 인증 요청 실패:", error);

      // 에러 메시지에 따른 처리
      if (error.message.includes("404")) {
        toast.error("가입되지 않은 이메일입니다.");
      } else if (error.message.includes("409")) {
        toast.error("이미 인증된 이메일입니다.");
      } else {
        toast.error("인증 이메일 발송에 실패했습니다. 다시 시도해주세요.");
      }
    },
  });

  /**
   * 이메일 인증 요청 실행 함수
   * @param email - 인증을 요청할 이메일 주소
   */
  const requestVerification = (email: string) => {
    requestMutation.mutate(email);
  };

  return {
    requestVerification,
    isLoading: requestMutation.isPending,
    isError: requestMutation.isError,
    error: requestMutation.error,
  };
};

/**
 * 이메일 인증 확인 훅
 * 이메일로 받은 인증 코드를 확인합니다
 */
export const useConfirmEmailVerification = () => {
  const confirmMutation = useMutation({
    mutationFn: confirmEmailVerificationApi,
    onSuccess: () => {
      toast.success("이메일 인증이 완료되었습니다.");
    },
    onError: (error: Error) => {
      console.error("이메일 인증 확인 실패:", error);

      // 에러 메시지에 따른 처리
      if (error.message.includes("400")) {
        toast.error("유효하지 않은 인증 토큰입니다.");
      } else if (error.message.includes("409")) {
        toast.error("이미 인증된 이메일이거나 인증 시간이 만료되었습니다.");
      } else {
        toast.error("이메일 인증에 실패했습니다. 다시 시도해주세요.");
      }
    },
  });

  /**
   * 이메일 인증 확인 실행 함수
   * @param token - 이메일로 받은 인증 토큰
   */
  const confirmVerification = (token: string) => {
    confirmMutation.mutate(token);
  };

  return {
    confirmVerification,
    isLoading: confirmMutation.isPending,
    isError: confirmMutation.isError,
    error: confirmMutation.error,
    isSuccess: confirmMutation.isSuccess,
  };
};
