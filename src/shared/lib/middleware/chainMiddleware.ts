import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 미들웨어 함수 타입 정의
 */
export type MiddlewareFunction = (
  request: NextRequest,
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * 여러 미들웨어를 체인으로 연결합니다
 * @param middlewares - 연결할 미들웨어 함수들
 * @returns 체인으로 연결된 미들웨어 함수
 */
export function chainMiddleware(
  ...middlewares: MiddlewareFunction[]
): MiddlewareFunction {
  return async (request: NextRequest) => {
    let response: NextResponse | undefined;

    for (const middleware of middlewares) {
      try {
        const result = await middleware(request);

        // 미들웨어가 NextResponse를 반환한 경우
        if (result instanceof NextResponse) {
          // 리다이렉트나 오류 응답인 경우 즉시 반환
          if (result.status >= 300) {
            console.log(
              `[Middleware Chain] 미들웨어에서 ${result.status} 응답 반환`,
            );
            return result;
          }

          // 정상 응답인 경우 마지막 응답으로 저장
          response = result;
        }
      } catch (error) {
        console.error("[Middleware Chain] 미들웨어 실행 중 오류:", error);
        // 오류 발생 시 500 응답 반환
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    }

    // 저장된 응답이 있으면 반환, 없으면 기본 NextResponse
    return response || NextResponse.next();
  };
}