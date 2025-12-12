"use client";

/**
 * 전역 에러 페이지
 * 서버/클라이언트 컴포넌트에서 발생한 에러를 캐치하여 UI 표시
 */

import { useEffect } from "react";
import {
  type ApiError,
  isClientError,
  isServerError,
} from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

/**
 * 에러 페이지 Props
 */
interface ErrorPageProps {
  /** 발생한 에러 객체 */
  error: Error & { digest?: string };
  /** 에러 복구 시도 함수 (페이지 새로고침) */
  reset: () => void;
}

/**
 * 전역 에러 페이지 컴포넌트
 * - 400번대 (401 제외): errorCode와 message 표시
 * - 500번대: 통일된 UI와 HTTP 코드 표시
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 에러 로깅 (운영 환경에서는 Sentry 등으로 전송)
    console.error("Error Page:", error);
  }, [error]);

  /**
   * ApiError 타입 체크 및 렌더링 분기
   * - ClientError (400번대): errorCode + message 표시
   * - ServerError (500번대): 통일된 에러 UI + HTTP 코드 표시
   * - 기타 에러: 일반 에러 메시지
   */
  if (isClientError(error)) {
    const apiError = error as ApiError;

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">요청 오류</CardTitle>
            <CardDescription>
              요청 처리 중 문제가 발생했습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* errorCode 표시 */}
            {apiError.errorResponse?.errorCode && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">
                  에러 코드: {apiError.errorResponse.errorCode}
                </p>
              </div>
            )}

            {/* message 표시 */}
            <p className="text-sm text-gray-700">
              {apiError.errorResponse?.message || apiError.message}
            </p>

            <Button onClick={reset} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isServerError(error)) {
    const apiError = error as ApiError;

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">서버 오류</CardTitle>
            <CardDescription>
              서버에서 문제가 발생했습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* HTTP 상태 코드 표시 */}
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                HTTP {apiError.statusCode}
              </p>
            </div>

            {/* 통일된 메시지 */}
            <p className="text-sm text-gray-700">
              일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>

            <Button onClick={reset} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 일반 에러 (ApiError가 아닌 경우)
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">오류 발생</CardTitle>
          <CardDescription>
            예상치 못한 문제가 발생했습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            {error.message || "알 수 없는 오류가 발생했습니다"}
          </p>

          <Button onClick={reset} className="w-full">
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
