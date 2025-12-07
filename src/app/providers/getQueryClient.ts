import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

/**
 * QueryClient 인스턴스를 생성하는 팩토리 함수
 * @returns 새로운 QueryClient 인스턴스
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /** 데이터가 stale 상태가 되는 시간 (5분) */
        staleTime: 1000 * 60 * 5,
        /** 캐시에서 데이터가 제거되는 시간 (10분) */
        gcTime: 1000 * 60 * 10,
        /** 에러 시 재시도 횟수 */
        retry: 1,
        /** 네트워크 재연결 시 자동 refetch 비활성화 */
        refetchOnReconnect: false,
        /** 윈도우 포커스 시 자동 refetch 비활성화 */
        refetchOnWindowFocus: false,
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
