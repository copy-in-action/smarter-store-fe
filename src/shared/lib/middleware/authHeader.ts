import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PAGES } from "@/shared/config/routes";
import type { MiddlewareFunction } from "./chainMiddleware";

/**
 * 로그인이 필수인 경로 목록
 * accessToken과 refreshToken이 모두 있어야 접근 가능
 */
const PROTECTED_ROUTES = [
  PAGES.BOOKING.SEATING_CHART.path, // 좌석 선택
];

/**
 * 인증 상태 헤더 설정 미들웨어
 * - 클라이언트에서 사용자 정보 조회 여부를 결정하기 위해 인증 상태를 헤더에 설정
 * - 로그인 필수 경로에 대한 인증 체크 및 리다이렉트 처리
 */
export const authHeaderMiddleware: MiddlewareFunction = (
  request: NextRequest,
  response?: NextResponse,
) => {
  const { pathname } = request.nextUrl;

  // /admin 경로는 제외 (관리자 인증은 별도 처리)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 인증 토큰 쿠키 존재 여부 확인
  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");
  const isAuthenticated = hasAccessToken && hasRefreshToken;

  // 로그인 필수 경로 체크
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !isAuthenticated) {
    console.log(
      `[Auth Header] 로그인 필요: ${pathname} - 로그인 페이지로 리다이렉트`,
    );
    const loginUrl = new URL(PAGES.AUTH.LOGIN.path, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 이전 응답이 있으면 사용, 없으면 새로 생성
  const nextResponse = response || NextResponse.next();
  nextResponse.headers.set("x-has-auth", hasAccessToken ? "true" : "false");
  // 리프래시 토큰이 함께 있는 경우 유저 로그인으로 설정
  nextResponse.headers.set("x-auth-role", hasRefreshToken ? "ROLE_USER" : "");
  return nextResponse;
};
