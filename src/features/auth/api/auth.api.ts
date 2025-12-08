import type { ApiResultResponse } from "@/shared/api";
import { login, refresh, signup } from "@/shared/api/orval/auth/auth";
import type {
  LoginRequest,
  RefreshTokenRequest,
  SignupRequest,
  UserResponse,
} from "@/shared/api/orval/types";

/**
 * 인증 API 래퍼 레이어
 * 
 * httpOnly 쿠키 기반 인증 시스템에서:
 * - orval 생성 코드의 union 타입을 정제
 * - fetch-wrapper에서 에러 처리를 담당 (상태코드 체크, ApiErrorClass throw)
 * - 성공 시에만 데이터 반환 (Clean Architecture Repository 패턴)
 * - 서버가 Set-Cookie 헤더로 토큰 관리
 */

/**
 * 이메일 로그인 API
 * 서버가 httpOnly 쿠키로 토큰을 설정하므로 클라이언트는 성공 여부만 확인
 * 
 * @param loginRequest - 로그인 요청 데이터
 * @returns 로그인 성공 결과
 * @throws ApiErrorClass - 로그인 실패 시 (fetch-wrapper에서 자동 처리)
 */
export const loginApi = async (
  loginRequest: LoginRequest,
): Promise<ApiResultResponse> => {
  await login(loginRequest);
  
  // fetch-wrapper가 에러를 모두 처리하므로 여기 도달 = 성공
  return { result: true };
};

/**
 * 회원가입 API
 * 
 * @param signupRequest - 회원가입 요청 데이터
 * @returns 사용자 응답 데이터
 * @throws ApiErrorClass - 회원가입 실패 시 (fetch-wrapper에서 자동 처리)
 */
export const signupApi = async (
  signupRequest: SignupRequest,
): Promise<UserResponse> => {
  const response = await signup(signupRequest);
  
  // fetch-wrapper가 에러를 처리했으므로 여기 도달 = 성공
  return response.data as UserResponse;
};

/**
 * 토큰 갱신 API
 * 서버가 Set-Cookie 헤더로 새로운 토큰을 설정
 * 
 * @param refreshRequest - 리프레시 토큰 요청 데이터
 * @returns 토큰 갱신 성공 결과
 * @throws ApiErrorClass - 토큰 갱신 실패 시 (fetch-wrapper에서 자동 처리)
 */
export const refreshTokenApi = async (
  refreshRequest: RefreshTokenRequest,
): Promise<ApiResultResponse> => {
  await refresh(refreshRequest);
  
  // fetch-wrapper가 에러를 모두 처리하므로 여기 도달 = 성공
  return { result: true };
};
