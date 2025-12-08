/**
 * shared/api Public API
 *
 * API 관련 공통 코드들을 다른 레이어에서 사용할 수 있도록 export
 */

// API 클라이언트
export { ApiErrorClass, apiClient, orvalFetch } from "./fetch-wrapper";

// 공통 API 응답 타입
export type { ApiResultResponse } from "./types";
