"use client";

/**
 * User 엔티티 컨텍스트
 * 사용자 인증 상태와 정보를 전역으로 관리합니다.
 */

import { createContext, type ReactNode, useContext, useState } from "react";
import { useGetUserInfo } from "@/entities/user";
import type { UserResponse } from "@/shared/api/orval/types";

/**
 * 인증 컨텍스트 타입
 */
interface AuthContextValue {
  /** 현재 로그인된 사용자 정보 */
  user: UserResponse | undefined;
  /** 사용자 정보 로딩 상태 */
  isLoading: boolean;
  /** 로그인 여부 */
  isAuthenticated: boolean;
  /** 로그인 후 사용자 정보 설정 */
  setUser: (user: UserResponse | null) => void;
  /** 로그아웃 */
  logout: () => void;
}

/**
 * 인증 컨텍스트
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider Props 타입
 */
interface AuthProviderProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 초기 인증 상태 */
  hasInitialAuth: boolean;
  /** 서버에서 가져온 초기 사용자 데이터 */
  initialUserData?: UserResponse | null;
}

/**
 * 인증 상태를 전역으로 관리하는 Provider
 * @description entities 레이어에서 정의하고, app 레이어에서 주입합니다
 */
export const AuthProvider = ({
  children,
  hasInitialAuth,
  initialUserData,
}: AuthProviderProps) => {
  // 사용자 정보와 인증 상태를 로컬에서 관리
  const [user, setUser] = useState<UserResponse | null>(
    initialUserData || null,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(hasInitialAuth);

  const userQuery = useGetUserInfo({
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    // 창 포커스 시 자동 갱신
    // refetchOnWindowFocus: true,
    // 네트워크 재연결 시 갱신
    // refetchOnReconnect: true,
    enabled: hasInitialAuth && !initialUserData, // 초기 데이터가 없을 때만 요청
    initialData: initialUserData || undefined, // 서버에서 가져온 데이터를 초기값으로 설정
  });

  /**
   * 로그인 후 사용자 정보 설정
   */
  const handleSetUser = (userData: UserResponse | null) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
  };

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextValue = {
    user: user || userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: isAuthenticated,
    setUser: handleSetUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 인증 상태를 사용하는 훅
 * @description AuthProvider 내부에서만 사용 가능합니다
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
