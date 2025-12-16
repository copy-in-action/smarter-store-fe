/**
 * 서버 사이드 사용자 API 함수들
 */

import { getMeUrl } from "@/shared/api/orval/auth/auth";
import type { UserResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 현재 로그인된 사용자 정보를 조회합니다
 * @returns 사용자 정보 또는 null (인증 실패시)
 */
export async function getUserInfoServer(): Promise<UserResponse | null> {
  try {
    const response = await serverFetch<UserResponse>(getMeUrl(), {
      requireAuth: true, // 인증 필요한 요청으로 설정
      cache: "no-store", // 서버에서는 항상 최신 정보 조회
    });

    return response;
  } catch (error) {
    console.error("서버에서 사용자 정보 조회 실패:", error);
    return null;
  }
}
