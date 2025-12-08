/**
 * API 응답 공통 타입 정의
 *
 * FSD 아키텍처의 shared 레이어에서 제공하는 공통 API 응답 인터페이스
 * 모든 API 응답은 이 타입들을 기반으로 구성됩니다
 */

export interface ApiResultResponse {
  /** 작업 성공 여부 */
  result: boolean;
}
