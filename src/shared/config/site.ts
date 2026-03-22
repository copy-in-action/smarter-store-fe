/**
 * 사이트 설정
 * 환경변수에서 사이트 URL을 가져옵니다.
 */

/**
 * 사이트 기본 URL (프로토콜 포함)
 * @example "https://ticket.devhong.cc"
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ticket.devhong.cc";

/**
 * 사이트 도메인 (프로토콜 제외)
 * @example "ticket.devhong.cc"
 */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
