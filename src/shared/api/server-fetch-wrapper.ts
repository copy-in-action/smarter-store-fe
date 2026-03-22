/**
 * 서버 컴포넌트 전용 Fetch Wrapper
 * 서버 사이드에서 API 요청 시 인증, 에러 처리를 담당
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ErrorResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config/routes";
import { createApiError, UnauthorizedError } from "../lib/errors";

/**
 * 서버 fetch 옵션
 */
interface ServerFetchOptions extends RequestInit {
  /** 인증이 필요한 요청인지 여부 */
  requireAuth?: boolean;
  /** 관리자 권한이 필요한 요청인지 여부 */
  requireAdmin?: boolean;
}

/**
 * 서버 컴포넌트용 API 클라이언트
 * 인증 토큰 자동 추가, 에러 처리 담당
 *
 * @param url - 요청 URL (절대 경로)
 * @param options - fetch 옵션 및 인증 설정
 * @returns Promise<T> - 응답 데이터
 */
// biome-ignore lint/suspicious/noExplicitAny: API 응답 타입이 다양하므로 any 허용
export async function serverFetch<T = any>(
  url: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const {
    requireAuth = false,
    requireAdmin = false,
    ...fetchOptions
  } = options;

  /**
   * 인증이 필요한 경우 쿠키에서 토큰 확인
   * - requireAuth: 일반 사용자 인증
   * - requireAdmin: 관리자 인증
   */
  // 기본 헤더 설정
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Vercel 배포 검증 헤더 추가 (Cloudflare 보안 우회용)
  if (process.env.VERCEL_DEPLOYMENT_VERIFY_TOKEN) {
    defaultHeaders["x-vercel-verify"] =
      process.env.VERCEL_DEPLOYMENT_VERIFY_TOKEN;
  }

  if (requireAuth || requireAdmin) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value; // httpOnly 쿠키 확인
    const refreshToken = cookieStore.get("refreshToken")?.value; // httpOnly 쿠키 확인

    // 쿠키가 없으면 로그인 페이지로 리다이렉트
    if (!accessToken) {
      const loginPath = requireAdmin
        ? PAGES.ADMIN.AUTH.LOGIN.path
        : PAGES.AUTH.LOGIN.path;
      redirect(loginPath);
    }
    const cookieHeaderValue = `accessToken=${accessToken}; refreshToken=${refreshToken}`;
    defaultHeaders.Cookie = cookieHeaderValue;
  }

  // 최종 fetch 옵션 구성
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  };

  try {
    // console.log(`🚀 Server API Request: ${config.method || "GET"} ${url}`);

    const response = await fetch(url, config);

    /**
     * 에러 응답 처리
     * - 401: 로그인 페이지로 리다이렉트
     * - 400번대: ClientError throw
     * - 500번대: ServerError throw
     */
    if (!response.ok) {
      await handleServerResponseError(response, requireAdmin);
    }

    // 빈 응답 처리 (204 No Content 등)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {
        status: response.status,
        data: {},
        headers: response.headers,
      } as T;
    }

    // JSON 응답 파싱
    const body = await response.text();
    const data = body ? JSON.parse(body) : {};
    // console.log(`✅ Server API Response: ${response.status}`);

    return { status: response.status, data, headers: response.headers } as T;
  } catch (error) {
    // UnauthorizedError는 이미 redirect 처리됨
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    // 네트워크 에러 등 fetch 자체 실패
    if (error instanceof Error && error.message.includes("fetch")) {
      console.error("❌ Server Network Error:", error);
      throw new Error("네트워크 연결에 실패했습니다");
    }

    // 기타 에러는 그대로 throw
    throw error;
  }
}

/**
 * 서버 응답 에러 처리
 * @param response - fetch 응답 객체
 * @param isAdmin - 관리자 API 여부
 */
async function handleServerResponseError(
  response: Response,
  isAdmin = false,
): Promise<never> {
  let errorResponse: ErrorResponse | undefined;

  try {
    errorResponse = await response.json();
  } catch {
    // JSON 파싱 실패 시 기본 에러 응답 생성
    errorResponse = {
      errorCode: `HTTP_${response.status}`,
      message: `요청 실패 (${response.status})`,
    };
  }

  /**
   * 401 Unauthorized 처리
   * 서버 컴포넌트에서는 redirect()로 로그인 페이지 이동
   */
  if (response.status === 401) {
    const loginPath = isAdmin
      ? PAGES.ADMIN.AUTH.LOGIN.path
      : PAGES.AUTH.LOGIN.path;

    console.log(`❌ 인증 실패 - ${loginPath}로 리다이렉트`);
    redirect(loginPath);
  }

  // 나머지 에러는 적절한 에러 객체 생성 후 throw
  const apiError = createApiError(response.status, errorResponse);
  console.error(`❌ Server API Error [${response.status}]:`, errorResponse);

  throw apiError;
}
