/**
 * 사용자 관련 API 함수들 (React Query 연동)
 */

import * as Sentry from "@sentry/react";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { me } from "@/shared/api/orval/auth/auth";
import type { UserResponse } from "@/shared/api/orval/types";

/**
 * 사용자 쿼리 키 상수
 */
export const USER_QUERY_KEYS = {
  all: ["user"] as const,
  me: () => [...USER_QUERY_KEYS.all, "me"] as const,
};

/**
 * 현재 로그인된 사용자 정보를 조회하는 훅
 * @param options - useQuery 추가 옵션
 */
export const useGetUserInfo = (
  options?: Omit<UseQueryOptions<UserResponse, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.me(),
    queryFn: async (): Promise<UserResponse> => {
      const response = await me();

      if (response.status === 200) {
        const user = response.data;
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.username,
        });

        return user;
      }

      throw new Error("Failed to fetch user info");
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    ...options,
  });
};
