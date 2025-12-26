import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";
import { loginUser } from "@/entities/auth";
import { PAGES } from "@/shared/constants";

/**
 * 이메일 로그인 훅
 * 로그인 요청을 처리하고 성공/실패에 따른 액션을 수행합니다
 * @param redirectUrl - 로그인 후 리다이렉트할 URL
 */
const useEmailLogin = (redirectUrl?: string) => {
  const router = useRouter();
  const { setUser } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data);

      // 리다이렉트 URL이 있으면 해당 URL로, 없으면 메인 페이지로 이동
      const targetUrl = redirectUrl || PAGES.HOME.path;
      router.push(targetUrl);
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
      toast.error(error.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
    },
  });

  return {
    login: loginMutation,
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
  };
};

export default useEmailLogin;
