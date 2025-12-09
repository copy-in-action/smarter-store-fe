/**
 * TanStack Query Client 설정 및 전역 에러 처리
 * 
 * ## 주요 기능
 * - SSR/클라이언트 일관된 QueryClient 제공
 * - TanStack Query v5 호환 전역 에러 처리
 * - httpOnly 쿠키 기반 인증에서 401 에러 시 클라이언트에서만 리다이렉트
 * - 서버/클라이언트 환경 분리 대응
 * 
 * @see {@link ../../document/API_아키텍쳐.md} 전체 API 아키텍처 및 플로우
 */

import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiErrorClass } from "@/shared/api/fetch-wrapper";

/**
 * 401 에러 시 로그인 페이지로 리다이렉트하는 핸들러
 * 
 * httpOnly 쿠키 방식에서는:
 * - 서버: 쿠키 만료 시 로깅만 처리 (리다이렉트는 클라이언트에 위임)
 * - 클라이언트: 토스트 표시 및 로그인 페이지로 리다이렉트
 */
const handleAuthError = (error: unknown) => {
  if (error instanceof ApiErrorClass && error.status === 401) {
    if (typeof window !== "undefined") {
      // 클라이언트 환경: 사용자에게 알리고 리다이렉트
      console.log("🔄 클라이언트: 401 에러 감지 - httpOnly 쿠키 만료 또는 인증 실패");
      toast.error("로그인이 필요합니다.");
      
      // 지연 후 리다이렉트 (토스트 메시지 표시 시간 확보)
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
    } else {
      // 서버 환경: 로깅만 처리, 리다이렉트는 클라이언트에 위임
      console.log("🔄 서버: 401 에러 감지 - httpOnly 쿠키 만료 또는 인증 실패");
      // 서버에서는 toast나 window 접근 불가
      // 에러는 클라이언트로 전파되어 클라이언튴에서 처리
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
          // 401 에러는 재시도 하지 않음 (httpOnly 쿠키 만료/부정인증)
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
          // 401 에러는 재시도 하지 않음 (httpOnly 쿠키 만료/부정인증)
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
