"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { PAGES } from "@/shared/constants";
import {
  AUTH_EVENTS,
  type UnauthorizedEventData,
} from "@/shared/events/auth-events";

/**
 * 인증 관련 이벤트를 전역적으로 처리하는 컴포넌트
 * 앱의 최상위 레벨에서 사용해야 함
 */
export function AuthEventHandler() {
  const router = useRouter();

  useEffect(() => {
    /**
     * 일반 사용자 인증 실패 이벤트 핸들러
     * 리다이렉트 URL을 쿼리 파라미터로 추가하여 로그인 페이지로 이동
     */
    const handleUnauthorized = (event: CustomEvent<UnauthorizedEventData>) => {
      const { redirectUrl, message } = event.detail;
      
      if (message) {
        toast.error(message);
      }

      // 리다이렉트 URL을 쿼리 파라미터로 추가
      const loginUrl = `${PAGES.AUTH.LOGIN.path}?redirect=${encodeURIComponent(redirectUrl)}`;
      router.push(loginUrl);
    };

    /**
     * 관리자 인증 실패 이벤트 핸들러
     * 관리자 로그인 페이지로 이동
     */
    const handleAdminUnauthorized = (event: CustomEvent<{ message?: string }>) => {
      const { message } = event.detail;
      
      if (message) {
        toast.error(message);
      }

      router.push(PAGES.ADMIN.AUTH.LOGIN.path);
    };

    // 이벤트 리스너 등록
    window.addEventListener(
      AUTH_EVENTS.UNAUTHORIZED,
      handleUnauthorized as EventListener
    );
    window.addEventListener(
      AUTH_EVENTS.ADMIN_UNAUTHORIZED,
      handleAdminUnauthorized as EventListener
    );

    // 클린업
    return () => {
      window.removeEventListener(
        AUTH_EVENTS.UNAUTHORIZED,
        handleUnauthorized as EventListener
      );
      window.removeEventListener(
        AUTH_EVENTS.ADMIN_UNAUTHORIZED,
        handleAdminUnauthorized as EventListener
      );
    };
  }, [router]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}