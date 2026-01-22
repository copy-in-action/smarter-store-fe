"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/entities/user";

/**
 * 토큰 자동 갱신을 관리하는 컴포넌트
 * 일정 주기로 토큰 갱신을 시도하여 사용자 세션을 유지
 * 로그인된 사용자에게만 자동으로 실행
 */
export function TokenRefreshManager() {
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);

  useEffect(() => {
    // 로그인되지 않은 경우 실행하지 않음
    if (!isAuthenticated) return;

    /**
     * 주기적으로 토큰 갱신을 시도하는 함수
     * BFF API를 통해 서버에서 refresh token을 관리
     */
    const refreshToken = async () => {
      if (isRefreshing.current) return;

      isRefreshing.current = true;

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          console.log("🔄 토큰 자동 갱신 성공");
        } else {
          console.log("🔄 토큰 자동 갱신 실패");
        }
      } catch (_) {
      } finally {
        isRefreshing.current = false;
      }
    };

    /**
     * 토큰 갱신 주기 설정
     * - 일반적으로 토큰 만료 시간의 1/2 ~ 2/3 지점에서 갱신
     * - 여기서는 5분마다 갱신 시도 (서버 설정에 맞게 조정 필요)
     */
    const REFRESH_INTERVAL = 1 * 60 * 1000; // 5분

    // 초기 지연 후 주기적 실행
    const initialDelay = 30 * 1000; // 30초 후 첫 실행

    const timeoutId = setTimeout(() => {
      refreshToken(); // 첫 실행
      intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);
    }, initialDelay);

    // 클린업
    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);

  // UI를 렌더링하지 않음
  return null;
}
