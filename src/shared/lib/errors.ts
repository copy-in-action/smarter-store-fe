/**
 * API 에러 처리를 위한 커스텀 에러 클래스
 */

import type { ErrorResponse } from "@/shared/api/orval/types";

/**
 * API 에러 기본 클래스
 */
export class ApiError extends Error {
  /** HTTP 상태 코드 */
  statusCode: number;
  /** 에러 응답 데이터 (errorCode, message 포함) */
  errorResponse?: ErrorResponse;

  constructor(
    message: string,
    statusCode: number,
    errorResponse?: ErrorResponse,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorResponse = errorResponse;
  }
}

/**
 * 인증 에러 (401 Unauthorized)
 * 로그인 페이지로 리다이렉트 필요
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "로그인이 필요합니다", errorResponse?: ErrorResponse) {
    super(message, 401, errorResponse);
    this.name = "UnauthorizedError";
  }
}

/**
 * 클라이언트 에러 (400번대, 401 제외)
 * errorCode와 message를 UI에 표시
 */
export class ClientError extends ApiError {
  constructor(statusCode: number, errorResponse: ErrorResponse) {
    super(errorResponse.message, statusCode, errorResponse);
    this.name = "ClientError";
  }
}

/**
 * 서버 에러 (500번대)
 * 통일된 UI와 HTTP 코드 표시
 */
export class ServerError extends ApiError {
  constructor(statusCode: number, errorResponse?: ErrorResponse) {
    super(
      errorResponse?.message || "서버 오류가 발생했습니다",
      statusCode,
      errorResponse,
    );
    this.name = "ServerError";
  }
}

/**
 * 네트워크 에러 (연결 실패)
 */
export class NetworkError extends Error {
  constructor(message = "네트워크 연결에 실패했습니다") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * HTTP 상태 코드에 따라 적절한 에러 객체 생성
 * @param statusCode - HTTP 상태 코드
 * @param errorResponse - 서버 에러 응답 (errorCode, message)
 * @returns 적절한 에러 객체
 */
export function createApiError(
  statusCode: number,
  errorResponse?: ErrorResponse,
): ApiError {
  /**
   * 상태 코드별 에러 타입 분기
   * - 401: 인증 에러 (로그인 페이지로 리다이렉트)
   * - 400번대 (401 제외): errorCode와 message 표시
   * - 500번대: 통일된 UI + HTTP 코드 표시
   */
  if (statusCode === 401) {
    return new UnauthorizedError(errorResponse?.message, errorResponse);
  }

  if (statusCode >= 400 && statusCode < 500) {
    return new ClientError(
      statusCode,
      errorResponse || {
        errorCode: "UNKNOWN_ERROR",
        message: "알 수 없는 오류가 발생했습니다",
      },
    );
  }

  if (statusCode >= 500) {
    return new ServerError(statusCode, errorResponse);
  }

  return new ApiError(
    errorResponse?.message || `API 요청 실패 (${statusCode})`,
    statusCode,
    errorResponse,
  );
}

/**
 * 에러가 특정 타입인지 확인하는 타입 가드
 */
export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError;
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
