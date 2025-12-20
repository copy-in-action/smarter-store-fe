import { type NextRequest, NextResponse } from "next/server";
import { getRefreshUrl } from "@/shared/api/orval/auth/auth";

/**
 * 토큰 갱신 BFF API
 * 클라이언트의 httpOnly 쿠키를 백엔드로 전달하여 토큰 갱신
 */
export async function POST(request: NextRequest) {
  try {
    // 클라이언트의 쿠키를 그대로 백엔드로 전달
    const cookieHeader = request.headers.get("cookie");
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const response = await fetch(getRefreshUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { message: data || "토큰 갱신 실패" },
        { status: response.status },
      );
    }

    // 성공 시 백엔드의 Set-Cookie 헤더를 클라이언트로 전달
    const responseHeaders = new Headers();

    const setCookieHeaders = response.headers.get("set-cookie");
    if (setCookieHeaders) {
      responseHeaders.set("Set-Cookie", setCookieHeaders);
    }

    return NextResponse.json(
      { result: true, message: "토큰 갱신 성공" },
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("BFF 토큰 갱신 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
