/**
 * 인증 관련 이벤트 상수
 */
export const AUTH_EVENTS = {
  /** 인증 실패 (401) 이벤트 */
  UNAUTHORIZED: 'auth:unauthorized',
  /** 관리자 인증 실패 이벤트 */
  ADMIN_UNAUTHORIZED: 'auth:admin-unauthorized',
} as const;

/**
 * 인증 실패 이벤트 데이터 타입
 */
export interface UnauthorizedEventData {
  /** 현재 페이지 URL (리다이렉트용) */
  redirectUrl: string;
  /** 에러 메시지 */
  message?: string;
}

/**
 * 인증 실패 이벤트를 발생시킵니다
 * @param redirectUrl - 로그인 후 돌아갈 URL
 * @param message - 에러 메시지
 */
export const dispatchUnauthorizedEvent = (
  redirectUrl: string,
  message?: string
) => {
  if (typeof window === 'undefined') return;

  const eventData: UnauthorizedEventData = {
    redirectUrl,
    message,
  };

  window.dispatchEvent(
    new CustomEvent(AUTH_EVENTS.UNAUTHORIZED, {
      detail: eventData,
    })
  );
};

/**
 * 관리자 인증 실패 이벤트를 발생시킵니다
 * @param message - 에러 메시지
 */
export const dispatchAdminUnauthorizedEvent = (message?: string) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(AUTH_EVENTS.ADMIN_UNAUTHORIZED, {
      detail: { message },
    })
  );
};