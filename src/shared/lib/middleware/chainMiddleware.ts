import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 미들웨어 함수 타입 정의
 */
export type MiddlewareFunction = (
  request: NextRequest,
  response?: NextResponse,
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * 여러 미들웨어를 체인으로 연결합니다
 * 이전 미들웨어의 response를 다음 미들웨어로 전달하여 누적 처리
 * @param middlewares - 연결할 미들웨어 함수들
 * @returns 체인으로 연결된 미들웨어 함수
 */
export function chainMiddleware(
  ...middlewares: MiddlewareFunction[]
): MiddlewareFunction {
  return async (request: NextRequest) => {
    let currentResponse: NextResponse | undefined;

    for (const middleware of middlewares) {
      try {
        const result = await middleware(request, currentResponse);

        // 미들웨어가 NextResponse를 반환한 경우
        if (result instanceof NextResponse) {
          // 리다이렉트나 오류 응답인 경우 즉시 반환
          if (result.status >= 300) {
            console.log(
              `[Middleware Chain] 미들웨어에서 ${result.status} 응답 반환`,
            );
            return result;
          }

          // 정상 응답인 경우 다음 미들웨어로 전달할 response로 설정
          currentResponse = result;
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

    // 최종 응답 반환, 없으면 기본 NextResponse
    return currentResponse || NextResponse.next();
  };
}