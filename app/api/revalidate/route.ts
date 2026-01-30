/**
 * On-Demand Revalidation API
 * 관리자가 데이터를 수정했을 때 특정 페이지 캐시를 즉시 재생성
 */

import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 페이지 재검증 API
 * @example
 * POST /api/revalidate
 * Body: { path: "/", secret: "your-secret" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, secret } = body;

    // 보안: secret 키 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    // 경로별 재검증
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
      return NextResponse.json({
        revalidated: true,
        type: "path",
        value: path,
        now: Date.now(),
      });
    }

    return NextResponse.json(
      { message: "Missing path parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error },
      { status: 500 }
    );
  }
}
