/**
 * 디바이스 정보 인터페이스
 */
export interface DeviceInfo {
  /** 모바일 디바이스 여부 (User-Agent 기반) */
  isMobileDevice: boolean;
  /** 작은 화면 여부 (화면 크기 기반) */
  isSmallScreen: boolean;
  /** 최종 모바일 UI 사용 여부 */
  isMobile: boolean;
}

/**
 * User-Agent를 통해 서버에서 모바일 디바이스 감지
 * @param userAgent - 브라우저 User-Agent 문자열
 * @returns 모바일 디바이스 여부
 */
export function detectMobileDevice(userAgent: string): boolean {
  const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

/**
 * 화면 크기가 작은지 확인 (768px 이하)
 * @returns 작은 화면 여부
 */
export function isSmallScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

/**
 * 하이브리드 모바일 감지 로직
 * User-Agent 우선, 그 다음 화면 크기
 * @param isMobileDevice - User-Agent 기반 모바일 디바이스 여부
 * @returns 최종 모바일 UI 사용 여부
 */
export function shouldUseMobileUI(isMobileDevice: boolean): boolean {
  // 모바일 디바이스면 무조건 모바일 UI
  if (isMobileDevice) return true;
  
  // PC지만 화면이 작으면 모바일 UI
  return isSmallScreen();
}