import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PAGES } from "@/shared/constants/routes";

/**
 * JWT 토큰을 디코딩하여 페이로드 추출 (검증 없이)
 * @param token - JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

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

  // 쿠키에서 토큰 추출
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    console.log(
      "[Admin Auth] 관리자 토큰이 없습니다. 로그인 페이지로 리다이렉트",
    );
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);
    // 원래 접근하려던 페이지를 쿼리 파라미터로 저장
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // JWT 디코딩하여 페이로드 확인
  const payload = decodeJWT(token);

  if (!payload) {
    console.log(
      "[Admin Auth] 유효하지 않은 토큰 형식입니다. 로그인 페이지로 리다이렉트",
    );
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 만료 시간 확인
  if (payload.exp && payload.exp < Date.now() / 1000) {
    console.log(
      "[Admin Auth] 토큰이 만료되었습니다. 로그인 페이지로 리다이렉트",
    );
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // auth 권한 확인
  if (payload.auth !== "ROLE_ADMIN") {
    console.log(`[Admin Auth] 관리자 권한이 없습니다. auth: ${payload.auth}`);
    const loginUrl = new URL(PAGES.ADMIN.AUTH.LOGIN.path, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 디코딩된 정보를 헤더에 추가 (주의: 서명 검증되지 않은 정보)
  const response = NextResponse.next();
  response.headers.set("x-admin-sub", payload.sub);
  response.headers.set("x-admin-auth", payload.auth);

  return response;
}
