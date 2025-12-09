"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login1 } from "@/shared/api/orval/admin-auth/admin-auth";
import type { AdminLoginRequest } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";

/**
 * 관리자 로그인 뮤테이션 훅
 * @returns 로그인 뮤테이션 객체
 */
export function useAdminLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: ["admin", "login"],

    /**
     * 관리자 로그인 API 호출
     * @param data - 로그인 요청 데이터
     */
    mutationFn: async (data: AdminLoginRequest) => {
      const response = await login1(data);

      if (response.status !== 200) {
        throw new Error("로그인에 실패했습니다");
      }

      return response;
    },

    /**
     * 로그인 성공 시 처리
     */
    onSuccess: () => {
      toast.success("로그인 성공");
      router.push(PAGES.ADMIN.path);
      router.refresh();
    },

    /**
     * 로그인 실패 시 처리
     * @param error - 에러 객체
     */
    onError: (error: Error) => {
      console.error("Admin login error:", error);
      toast.error(error.message || "로그인 중 오류가 발생했습니다");
    },
  });
}
