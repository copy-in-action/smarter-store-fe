import { jwtVerify, SignJWT } from "jose";

/**
 * JWT 페이로드에서 추출되는 관리자 정보
 */
export interface AdminJWTPayload {
  /** JWT subject (관리자 식별자) */
  sub: string;
  /** 권한 (ROLE_ADMIN 등) */
  auth: string;
  /** 발급 시간 */
  iat: number;
  /** 만료 시간 */
  exp: number;
}

/**
 * JWT 시크릿 키를 가져옵니다
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다");
  }
  return new TextEncoder().encode(secret);
}

/**
 * 관리자 JWT 토큰을 검증합니다
 * @param token - 검증할 JWT 토큰
 * @returns 검증된 관리자 정보 또는 null
 */
export async function verifyAdminToken(
  token: string,
): Promise<AdminJWTPayload | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);

    // JWT 구조 검증
    if (
      typeof payload.sub === "string" &&
      typeof payload.auth === "string" &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number"
    ) {
      // 관리자 권한 확인
      if (payload.auth === "ROLE_ADMIN") {
        return {
          sub: payload.sub,
          auth: payload.auth,
          iat: payload.iat,
          exp: payload.exp,
        };
      } else {
        console.warn(`[JWT] 관리자 권한이 아닙니다: ${payload.auth}`);
        return null;
      }
    }

    console.warn("[JWT] 필수 필드가 누락되었습니다:", payload);
    return null;
  } catch (error) {
    console.error("[JWT] 토큰 검증 실패:", error);
    return null;
  }
}

/**
 * 쿠키에서 관리자 토큰을 추출합니다
 * @param cookieHeader - Cookie 헤더 문자열
 * @returns 추출된 토큰 또는 null
 */
export function extractAdminTokenFromCookie(
  cookieHeader?: string | null,
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  cookies.map((cookie) => console.log(cookie));
  const adminTokenCookie = cookies.find((cookie) =>
    cookie.startsWith("accessToken="),
  );

  if (!adminTokenCookie) return null;

  const token = adminTokenCookie.split("=")[1];
  return token || null;
}

/**
 * 관리자 권한을 확인합니다
 * @param auth - JWT의 auth 필드 값
 * @returns 관리자 권한 여부
 */
export function isAdminRole(auth: string): boolean {
  return auth === "ROLE_ADMIN";
}

/**
 * JWT 토큰이 만료되었는지 확인합니다
 * @param exp - JWT의 exp 필드 값 (초 단위)
 * @returns 만료 여부
 */
export function isTokenExpired(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= exp;
}
