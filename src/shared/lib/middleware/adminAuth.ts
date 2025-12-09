import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PAGES } from "@/shared/constants/routes";
import {
  extractAdminTokenFromCookie,
  verifyAdminToken,
} from "@/shared/lib/auth/adminAuth";

/**
 * 관리자 인증 미들웨어
 * /admin/* 경로에 대한 JWT 토큰 검증을 수행합니다
 * @param request - NextRequest 객체
 * @returns NextResponse 또는 void
 */
export async function adminAuthMiddleware(
  request: NextRequest,
): Promise<NextResponse | void> {
  const { pathname } = request.nextUrl;

  // 관리자 페이지 경로가 아닌 경우 통과
  if (!pathname.startsWith("/admin")) {
    return;
  }

  // 로그인 페이지는 제외
  if (pathname === PAGES.ADMIN.AUTH.LOGIN.path) {
    return;
  }

  console.log(`[Admin Auth] 관리자 페이지 접근 시도: ${pathname}`);

  // 쿠키에서 관리자 토큰 추출
  const cookieHeader = request.headers.get("cookie");
  const token = extractAdminTokenFromCookie(cookieHeader);
  console.log("🚀 ~ adminAuthMiddleware ~ token:", token);

  if (!token) {
    console.log(
      "[Admin Auth] 관리자 토큰이 없습니다. 로그인 페이지로 리다이렉트",
    );
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // JWT 토큰 검증
  const adminPayload = await verifyAdminToken(token);

  if (!adminPayload) {
    console.log(
      "[Admin Auth] 유효하지 않은 관리자 토큰입니다. 로그인 페이지로 리다이렉트",
    );
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);

    // 쿠키 삭제를 위한 응답 생성
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("admin_token");
    response.cookies.delete("adminToken");
    return response;
  }

  console.log(`[Admin Auth] 관리자 인증 성공: ${adminPayload.sub}`);

  // 검증된 관리자 정보를 헤더에 추가
  const response = NextResponse.next();
  response.headers.set("x-admin-sub", adminPayload.sub);
  response.headers.set("x-admin-auth", adminPayload.auth);
  response.headers.set("x-admin-iat", adminPayload.iat.toString());
  response.headers.set("x-admin-exp", adminPayload.exp.toString());

  return response;
}
