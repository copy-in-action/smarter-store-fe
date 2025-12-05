/**
 * Bottom Navigation 메뉴 아이템 타입
 */
export interface BottomNavigationItem {
  /** 메뉴 아이템 고유 ID */
  id: string;
  /** 메뉴 라벨 */
  label: string;
  /** 이동할 경로 */
  href: string;
  /** 아이콘 컴포넌트 */
  icon: React.ComponentType<{ className?: string }>;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * Bottom Navigation 컴포넌트 Props
 */
export interface BottomNavigationProps {
  /** 현재 활성화된 메뉴 ID */
  activeItemId?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}
