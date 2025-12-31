import { NextRequest, NextResponse } from "next/server";
import type { MiddlewareFunction } from "./chainMiddleware";
import { detectMobileDevice } from "../device";

/**
 * 디바이스 헤더 설정 미들웨어
 * User-Agent를 기반으로 모바일 디바이스를 감지하고 헤더에 추가
 */
export const deviceHeaderMiddleware: MiddlewareFunction = (
  request: NextRequest,
  response?: NextResponse,
) => {
  const userAgent = request.headers.get("user-agent") || "";
  const isMobileDevice = detectMobileDevice(userAgent);

  // 이전 응답이 있으면 사용, 없으면 새로 생성
  const nextResponse = response || NextResponse.next();
  nextResponse.headers.set("x-is-mobile-device", isMobileDevice.toString());

  return nextResponse;
};