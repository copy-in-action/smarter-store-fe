import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { MiddlewareFunction } from "./chainMiddleware";

/**
 * 인증 상태 헤더 설정 미들웨어
 * 클라이언트에서 사용자 정보 조회 여부를 결정하기 위해 인증 상태를 헤더에 설정
 */
export const authHeaderMiddleware: MiddlewareFunction = (
  request: NextRequest,
) => {
  // /admin 경로는 제외 (관리자 인증은 별도 처리)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 인증 토큰 쿠키 존재 여부 확인
  const hasAuth = request.cookies.has("accessToken");
  const hasUser = request.cookies.has("refreshToken");

  // 응답 생성 및 인증 상태 헤더 설정
  const response = NextResponse.next();
  response.headers.set("x-has-auth", hasAuth ? "true" : "false");
  // 리프래시 토킨이 함께 있는 경우 유저 로그인으로 설정
  response.headers.set("x-auth-role", hasUser ? "ROLE_USER" : "");
  return response;
};
