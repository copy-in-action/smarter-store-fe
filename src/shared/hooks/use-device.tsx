"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { DeviceInfo } from "../lib/device";
import { detectMobileDevice, isSmallScreen, shouldUseMobileUI } from "../lib/device";

interface DeviceContextValue {
  /** 디바이스 정보 */
  deviceInfo: DeviceInfo;
  /** 하이드레이션 완료 여부 */
  isHydrated: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

interface DeviceProviderProps {
  /** 서버에서 감지한 모바일 디바이스 여부 */
  initialIsMobileDevice: boolean;
  children: React.ReactNode;
}

/**
 * 디바이스 정보를 제공하는 Provider 컴포넌트
 * 서버 사이드 User-Agent 감지 + 클라이언트 화면 크기 감지
 */
export function DeviceProvider({ 
  initialIsMobileDevice, 
  children 
}: DeviceProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobileDevice: initialIsMobileDevice,
    isSmallScreen: false,
    isMobile: initialIsMobileDevice,
  });

  useEffect(() => {
    setIsHydrated(true);

    /**
     * 디바이스 정보 업데이트
     * 리사이즈 이벤트에서 호출
     */
    const updateDeviceInfo = () => {
      const isSmall = isSmallScreen();
      const newDeviceInfo: DeviceInfo = {
        isMobileDevice: initialIsMobileDevice,
        isSmallScreen: isSmall,
        isMobile: shouldUseMobileUI(initialIsMobileDevice),
      };

      setDeviceInfo(newDeviceInfo);
    };

    // 초기 설정
    updateDeviceInfo();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
    };
  }, [initialIsMobileDevice]);

  return (
    <DeviceContext.Provider value={{ deviceInfo, isHydrated }}>
      {children}
    </DeviceContext.Provider>
  );
}

/**
 * 디바이스 정보를 사용하는 hook
 * useAuth와 동일한 패턴으로 구현
 * @returns 디바이스 정보와 하이드레이션 상태
 */
export function useDevice() {
  const context = useContext(DeviceContext);
  
  if (!context) {
    throw new Error("useDevice must be used within DeviceProvider");
  }

  return context;
}

/**
 * 간단한 모바일 여부만 필요한 경우 사용하는 hook
 * @returns 하이드레이션 완료 후 최종 모바일 UI 사용 여부
 */
export function useIsMobile() {
  const { deviceInfo, isHydrated } = useDevice();
  
  // 하이드레이션 전에는 서버 값 사용
  return isHydrated ? deviceInfo.isMobile : deviceInfo.isMobileDevice;
}