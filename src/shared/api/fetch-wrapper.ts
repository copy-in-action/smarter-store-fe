import { toast } from "sonner";
import {
  dispatchAdminUnauthorizedEvent,
  dispatchUnauthorizedEvent,
} from "../auth-events";
import { getRefreshUrl } from "./orval/auth/auth";

/**
 * 토큰 갱신 상태 관리
 * 동시에 여러 401 응답이 와도 한 번만 refresh 요청을 보내도록 함
 */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * API 기본 URL
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_SERVER || "https://ticket-api.devhong.cc";

/**
 * API 에러 응답 타입
 */
interface ApiError {
  /** 에러 메시지 */
  message: string;
  /** 에러 코드 */
  code?: string;
  /** HTTP 상태 코드 */
  status: number;
}

/**
 * 토큰 갱신을 수행하는 함수
 * 동시에 여러 요청이 와도 한 번만 실행되도록 보장
 * @returns 새로운 액세스 토큰 또는 null (실패 시)
 */
const refreshAccessToken = async (): Promise<string | null> => {
  // 이미 갱신 중이면 기존 Promise 반환
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // 갱신 시작
  isRefreshing = true;

  refreshPromise = (async (): Promise<string | null> => {
    try {
      console.log("🔄 토큰 갱신 시도...");

      // BFF API Route 호출 (상대 경로)
      const response = await fetch(
        process.env.NODE_ENV === "production"
          ? getRefreshUrl()
          : "/api/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // httpOnly 쿠키 전송
        },
      );

      if (!response.ok) {
        console.log("❌ 토큰 갱신 실패");
        return null;
      }

      // 서버가 Set-Cookie 헤더로 새로운 토큰 설정
      console.log("✅ 토큰 갱신 성공");
      return "refreshed"; // 실제 토큰 값은 httpOnly 쿠키로 관리됨
    } catch (error) {
      console.error("❌ 토큰 갱신 중 오류:", error);
      return null;
    } finally {
      // 갱신 완료 - 상태 초기화
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * API 에러 클래스
 */
export class ApiErrorClass extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * 응답 에러 처리
 * @param response - fetch 응답 객체
 */
const handleResponseError = async (response: Response): Promise<never> => {
  let errorMessage = `HTTP ${response.status}`;
  let errorCode: string | undefined;

  try {
    const errorData: ApiError = await response.json();
    errorMessage = errorData.message || errorMessage;
    errorCode = errorData.code;
  } catch {
    // JSON 파싱 실패 시 기본 메시지 사용
    errorMessage = `Request failed with status ${response.status}`;
  }

  /**
   * httpOnly 쿠키 방식에서는 401 오류 시에도 쿠키 제거 불가
   * 서버에서 쿠키 만료 시 자동으로 제거됨
   */

  throw new ApiErrorClass(errorMessage, response.status, errorCode);
};

/**
 * 백엔드 URL을 환경에 맞게 변환 (클라이언트 전용)
 * - 개발 환경: rewrites 사용 → 상대 경로로 변환
 * - 프로덕션: CORS 방식 → 절대 URL 그대로 사용
 *
 * @param url - orval이 생성한 절대 URL
 * @returns 환경에 맞는 URL
 *
 * @example
 * // 개발 환경
 * transformUrl('http://devhong.asuscomm.com:48080/api/auth/login')
 * // → '/api/auth/login' (rewrites로 프록시)
 *
 * // 프로덕션
 * transformUrl('https://ticket-api.devhong.cc/api/auth/login') - (CORS 직접 호출)
 */
const transformUrl = (url: string): string => {
  // 이미 상대 경로면 그대로 반환
  if (!url.startsWith("http")) {
    return url;
  }

  // 프로덕션 환경: 절대 URL 그대로 사용 (CORS 방식)
  if (process.env.NODE_ENV === "production") {
    return url;
  }

  // 개발 환경: 절대 URL → 상대 경로 변환 (rewrites 프록시 사용)
  // http://devhong.asuscomm.com:48080/api/auth/login → /api/auth/login
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // URL 파싱 실패 시 원본 반환
    return url;
  }
};

/**
 * Fetch Wrapper 함수 (클라이언트 전용)
 * 인증 토큰 자동 추가, 토큰 갱신, 에러 처리, 응답 변환 등을 담당
 *
 * @param url - 요청 URL (orval이 생성한 절대 경로)
 * @param options - fetch 옵션
 * @param isRetry - 재시도 여부 (토큰 갱신 후 재시도 방지용)
 * @returns Promise<T> - 응답 데이터
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const apiClient = async <T = any>(
  url: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> => {
  // URL 변환: 절대 URL → 상대 경로 (rewrites로 프록시됨)
  const fullUrl = transformUrl(url);

  // 기본 헤더 설정
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // 최종 옵션 구성 - httpOnly 쿠키 전송을 위해 credentials 추가
  const config: RequestInit = {
    ...options,
    credentials: "include", // httpOnly 쿠키 전송을 위해 필수
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    // console.log(
    //   `🚀 API Request: ${config.method || "GET"} ${fullUrl}${isRetry ? " (재시도)" : ""}`,
    // );

    const response = await fetch(fullUrl, config);

    // 401 에러 처리
    if (response.status === 401 && !isRetry) {
      // 관리자 API인 경우
      if (fullUrl.includes("/api/admin/")) {
        console.log("❌ 관리자 인증 실패 - 관리자 로그인 페이지로 이동");

        // 이벤트 발생으로 관리자 로그인 페이지로 이동
        dispatchAdminUnauthorizedEvent("관리자 인증이 필요합니다");

        throw new ApiErrorClass("관리자 인증이 필요합니다", 401);
      }

      // 일반 사용자 API인 경우 - 토큰 갱신 시도
      // /me의 경우 로그인 여부를 응답에 따라 호출 측에서 처리
      // (ex. 로그인 여부에 따라 다르게 렌더링하는데 해당 로직이 동작하면 로그인페이로 이동됨)
      if (
        !fullUrl.includes("/api/auth/login") &&
        !fullUrl.includes("/api/auth/me")
      ) {
        console.log("🔄 401 응답 - 토큰 갱신 시도 (일반 사용자)");

        const newToken = await refreshAccessToken();

        if (newToken) {
          // 토큰 갱신 성공 - 새로운 쿠키로 재시도
          console.log("✅ 토큰 갱신 성공 - 요청 재시도");
          return apiClient<T>(url, options, true);
        } else {
          // 토큰 갱신 실패 - 일반 로그인 페이지로 이동
          console.log("❌ 토큰 갱신 실패 - 로그인 페이지로 이동");

          // 현재 페이지 URL을 리다이렉트 URL로 사용
          const redirectUrl =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/";
          dispatchUnauthorizedEvent(redirectUrl, "인증이 필요합니다");

          throw new ApiErrorClass("인증이 필요합니다", 401);
        }
      }
    }

    // 기타 에러 응답 처리
    if (!response.ok) {
      await handleResponseError(response);
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
    // console.log(`✅ API Response: ${response.status}`, data);

    return { status: response.status, data, headers: response.headers } as T;
  } catch (error) {
    // 네트워크 에러 등 fetch 자체 실패
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    console.error("❌ API Error:", error);
    toast.error("네트워크 오류가 발생했습니다.");
    throw new ApiErrorClass("Network error", 0);
  }
};

/**
 * Orval용 커스텀 fetch 함수
 * orval이 생성하는 API 함수들이 사용할 fetch wrapper
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const orvalFetch = async <T = any>(
  url: string,
  config: RequestInit = {},
): Promise<T> => {
  return apiClient<T>(url, config);
};
