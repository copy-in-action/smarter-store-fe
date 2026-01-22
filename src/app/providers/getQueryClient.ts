/**
 * TanStack Query Client 설정 및 전역 에러 처리
 *
 * ## 주요 기능
 * - SSR/클라이언트 일관된 QueryClient 제공
 * - TanStack Query v5 호환 전역 에러 처리
 * - httpOnly 쿠키 기반 인증에서 관리자/일반 사용자 차별화된 401 처리
 * - 관리자: 리프레시 토큰 미사용으로 즉시 로그아웃 (보안 강화)
 * - 일반 사용자: fetch-wrapper에서 리프레시 시도 후 실패 시 로그아웃
 * - 서버/클라이언트 환경 분리 대응
 *
 * @see {@link ../../document/API_아키텍쳐.md} 전체 API 아키텍처 및 플로우
 * @see {@link ../../document/admin-auth-process.md} 관리자 인증 프로세스
 */

import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";
import { ApiErrorClass } from "@/shared/api/fetch-wrapper";
import { PAGES } from "@/shared/config/routes";

/**
 * 현재 페이지가 관리자 페이지인지 확인
 */
const isAdminPage = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
};

/**
 * 401 에러 시 적절한 로그인 페이지로 리다이렉트하는 핸들러
 *
 * 현재 구현 방식:
 * - fetch-wrapper에서 이미 관리자/일반 사용자 구분 처리
 * - 관리자: 리프레시 토큰 시도 없이 즉시 401 반환 (보안 강화)
 * - 일반 사용자: 리프레시 토큰 갱신 시도 후 실패 시 401 반환
 * - QueryClient에서는 최종 401 에러에 대해서만 리다이렉트 처리
 */
const handleAuthError = (error: unknown) => {
  if (error instanceof ApiErrorClass && error.status === 401) {
    if (typeof window !== "undefined") {
      // 클라이언트 환경에서만 리다이렉트 처리
      const currentPath = window.location.pathname;
      const isAdmin = isAdminPage();

      if (isAdmin) {
        if (currentPath.startsWith(PAGES.ADMIN.AUTH.LOGIN.path)) return;
        console.log(
          "🔄 관리자 401 에러: 토큰 만료 - 관리자 로그인으로 리다이렉트",
        );

        // 관리자는 현재 페이지를 redirect 파라미터로 저장
        const redirectUrl = `${PAGES.ADMIN.AUTH.LOGIN.path}?redirect=${encodeURIComponent(currentPath)}`;

        // 즉시 리다이렉트 (관리자는 보안상 지연 없음)
        window.location.href = redirectUrl;
      } else {
        if (currentPath.startsWith(PAGES.AUTH.LOGIN.path)) return;

        console.log(
          "🔄 일반 사용자 401 에러: 리프레시 토큰 갱신 실패 - 로그인으로 리다이렉트",
        );

        // 일반 사용자도 현재 페이지를 redirect 파라미터로 저장
        const redirectUrl = `${PAGES.AUTH.LOGIN.path}?redirect=${encodeURIComponent(currentPath)}`;

        // 짧은 지연 후 리다이렉트 (사용자 경험 고려)
        setTimeout(() => {
          // 이미 로그인 페이지에 있으면 리다이렉트하지 않음
          if (
            !window.location.pathname.includes("/auth/login") &&
            !window.location.pathname.includes("/admin/auth/login")
          ) {
            window.location.href = redirectUrl;
          }
        }, 500);
      }
    } else {
      // 서버 환경: 로깅만 처리, 리다이렉트는 미들웨어에서 담당
      console.log("🔄 서버: 401 에러 감지 - 미들웨어에서 리다이렉트 처리 예정");
    }
  }
};

/**
 * QueryClient 인스턴스를 생성하는 팩토리 함수
 * @returns 새로운 QueryClient 인스턴스
 */
function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        /** 데이터가 stale 상태가 되는 시간 (5분) */
        staleTime: 1000 * 60 * 5,
        /** 캐시에서 데이터가 제거되는 시간 (10분) */
        gcTime: 1000 * 60 * 10,
        /** 에러 시 재시도 횟수 */
        retry: (failureCount, error) => {
          // 401 에러는 재시도 하지 않음
          // 관리자: 리프레시 토큰 미사용으로 즉시 로그아웃
          // 일반 사용자: 이미 fetch-wrapper에서 리프레시 시도 완료
          if (error instanceof ApiErrorClass && error.status === 401) {
            return false;
          }
          // 기타 에러는 1회 재시도
          return failureCount < 1;
        },
        /** 네트워크 재연결 시 자동 refetch 비활성화 */
        refetchOnReconnect: false,
        /** 윈도우 포커스 시 자동 refetch 비활성화 */
        refetchOnWindowFocus: false,
      },
      mutations: {
        /** 뮤테이션 기본 옵션 */
        retry: (failureCount, error) => {
          // 401 에러는 재시도 하지 않음
          // 관리자: 리프레시 토큰 미사용으로 즉시 로그아웃
          // 일반 사용자: 이미 fetch-wrapper에서 리프레시 시도 완료
          if (error instanceof ApiErrorClass && error.status === 401) {
            return false;
          }
          // 기타 에러는 1회 재시도
          return failureCount < 1;
        },
      },
      dehydrate: {
        /**
         * SSR 시 dehydrate할 쿼리를 결정합니다
         * pending 상태의 쿼리도 포함하여 streaming 지원
         */
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });

  // QueryClient에 전역 에러 핸들러 등록
  // SSR/클라이언트 환경을 고려한 401 에러 처리
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.query.state.status === "error") {
      handleAuthError(event.query.state.error);
    }
  });

  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.mutation.state.status === "error") {
      handleAuthError(event.mutation.state.error);
    }
  });

  return queryClient;
}

/** 브라우저에서 사용할 전역 QueryClient 인스턴스 */
let browserQueryClient: QueryClient | undefined;

/**
 * SSR과 클라이언트에서 일관된 QueryClient를 제공합니다
 *
 * - 서버: 각 요청마다 새 인스턴스 생성 (메모리 누수 방지)
 * - 클라이언트: 싱글톤 인스턴스 사용 (상태 유지)
 *
 * @returns QueryClient 인스턴스
 */
export function getQueryClient() {
  if (isServer) {
    // 서버에서는 항상 새 인스턴스 생성
    return makeQueryClient();
  } else {
    // 클라이언트에서는 싱글톤 패턴 사용
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
