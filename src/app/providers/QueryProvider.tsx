"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { getQueryClient } from "./getQueryClient";

/**
 * QueryProvider 컴포넌트 속성
 */
interface QueryProviderProps {
  /** 자식 컴포넌트들 */
  children: ReactNode;
}

/**
 * TanStack Query를 위한 Provider 컴포넌트
 * Next.js App Router와 SSR을 지원하는 React Query 클라이언트를 제공합니다
 */
export function QueryProvider({ children }: QueryProviderProps) {
  /**
   * SSR/SSG와 클라이언트에서 일관된 QueryClient 인스턴스를 가져옵니다
   * 서버에서는 새 인스턴스, 클라이언트에서는 싱글톤 인스턴스 사용
   */
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
