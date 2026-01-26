/**
 * 드래그 가능한 공연 목록 컴포넌트
 * DnD 컨텍스트와 공연 아이템들을 관리
 */

"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { TagPerformanceResponse } from "@/shared/api/orval/types";
import { DraggablePerformanceItem } from "./DraggablePerformanceItem";

/**
 * DraggablePerformanceList 컴포넌트 속성
 */
interface DraggablePerformanceListProps {
  /** 공연 목록 */
  performances: TagPerformanceResponse[];
  /** 아이템 이동 핸들러 */
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 드래그 가능한 공연 목록 컴포넌트
 * DndProvider로 드래그 앤 드롭 컨텍스트 제공
 */
export function DraggablePerformanceList({
  performances,
  onMoveItem,
  disabled = false,
}: DraggablePerformanceListProps) {
  if (performances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">선택한 태그에 등록된 공연이 없습니다.</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            공연 순서 (총 {performances.length}개)
          </h3>
          <p className="text-sm text-gray-500">
            드래그하여 순서를 변경할 수 있습니다
          </p>
        </div>

        {performances.map((performance, index) => (
          <DraggablePerformanceItem
            key={performance.performanceId}
            performance={performance}
            index={index}
            moveItem={onMoveItem}
            disabled={disabled}
          />
        ))}
      </div>
    </DndProvider>
  );
}
