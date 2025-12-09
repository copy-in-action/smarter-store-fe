import { adminAuthMiddleware } from "@/shared/lib/middleware/adminAuth";
import { chainMiddleware } from "@/shared/lib/middleware/chainMiddleware";

/**
 * Next.js 16 미들웨어 프록시
 * 여러 미들웨어를 체인으로 연결하여 실행합니다
 */
export const proxy = chainMiddleware(
  // 관리자 인증 미들웨어
  adminAuthMiddleware,

  // 추가 미들웨어들이 여기에 체인으로 연결됩니다
  // 예: corsMiddleware, rateLimitMiddleware, etc.
);

/**
 * 미들웨어가 실행될 경로 설정
 * 여러 미들웨어가 체인으로 실행될 경로들을 정의합니다
 */
export const config = {
  matcher: [
    // 관리자 페이지 보호
    "/admin/:path*",

    // 추가 보호 경로들이 여기에 추가됩니다
    // '/api/admin/:path*',
    // '/dashboard/:path*',
  ],
};
