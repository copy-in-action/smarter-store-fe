/**
 * 공연 순서 상태 관리 hook
 * 드래그 앤 드롭으로 변경된 순서를 추적하고 저장 페이로드 생성
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  TagPerformanceResponse,
  UpdateDisplayOrderRequest,
} from "@/shared/api/orval/types";

/**
 * useOrderState 반환 타입
 */
export interface UseOrderStateReturn {
  /** 현재 아이템 목록 */
  items: TagPerformanceResponse[];
  /** 아이템 목록 설정 */
  setItems: (items: TagPerformanceResponse[]) => void;
  /** 아이템 순서 이동 */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** 초기 순서로 리셋 */
  resetOrder: () => void;
  /** 변경사항 여부 */
  hasChanges: boolean;
  /** 순서 변경 API 페이로드 생성 */
  getOrderPayload: () => UpdateDisplayOrderRequest;
}

/**
 * 공연 순서 상태 관리 hook
 * @param initialItems - 초기 공연 목록
 * @returns 순서 관리 함수들 및 상태
 */
export const useOrderState = (
  initialItems: TagPerformanceResponse[],
): UseOrderStateReturn => {
  const [items, setItems] = useState<TagPerformanceResponse[]>(initialItems);
  const prevInitialItemsRef = useRef<TagPerformanceResponse[]>(initialItems);

  // initialItems 변경 시 items 동기화 (내용이 실제로 다를 때만)
  useEffect(() => {
    const prevItems = prevInitialItemsRef.current;

    // 배열 길이가 다르거나, ID 순서가 다를 때만 업데이트
    const needsUpdate =
      prevItems.length !== initialItems.length ||
      prevItems.some(
        (item, index) =>
          item.performanceId !== initialItems[index]?.performanceId,
      );

    if (needsUpdate) {
      setItems(initialItems);
      prevInitialItemsRef.current = initialItems;
    }
  }, [initialItems]);

  /**
   * 아이템 순서 이동
   * @param fromIndex - 시작 인덱스
   * @param toIndex - 목표 인덱스
   */
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  /**
   * 초기 순서로 리셋
   */
  const resetOrder = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  /**
   * 변경사항 여부 확인
   */
  const hasChanges = useMemo(() => {
    if (items.length !== initialItems.length) return true;
    return items.some(
      (item, index) => item.performanceId !== initialItems[index]?.performanceId,
    );
  }, [items, initialItems]);

  /**
   * 순서 변경 API 페이로드 생성
   */
  const getOrderPayload = useCallback((): UpdateDisplayOrderRequest => {
    return {
      performanceOrders: items.map((item, index) => ({
        performanceId: item.performanceId,
        displayOrder: index + 1, // 1부터 시작
      })),
    };
  }, [items]);

  return {
    items,
    setItems,
    moveItem,
    resetOrder,
    hasChanges,
    getOrderPayload,
  };
};
