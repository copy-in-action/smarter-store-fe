/**
 * 드래그 가능한 공연 항목 컴포넌트
 * react-dnd를 사용한 드래그 앤 드롭 구현
 */

"use client";

import type { Identifier } from "dnd-core";
import { GripVertical } from "lucide-react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { TagPerformanceResponse } from "@/shared/api/orval/types";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";

/**
 * 드래그 아이템 타입
 */
const ITEM_TYPE = "PERFORMANCE_ITEM";

/**
 * 드래그 아이템 인터페이스
 */
interface DragItem {
  /** 드래그 중인 항목의 인덱스 */
  index: number;
  /** 드래그 아이템 타입 */
  type: string;
}

/**
 * DraggablePerformanceItem 컴포넌트 속성
 */
interface DraggablePerformanceItemProps {
  /** 공연 데이터 */
  performance: TagPerformanceResponse;
  /** 현재 인덱스 */
  index: number;
  /** 아이템 이동 핸들러 */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 드래그 가능한 공연 항목 컴포넌트
 * 순서 변경을 위한 드래그 앤 드롭 기능 제공
 */
export function DraggablePerformanceItem({
  performance,
  index,
  moveItem,
  disabled = false,
}: DraggablePerformanceItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 드래그 기능 설정
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index, type: ITEM_TYPE } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 드롭 기능 설정
  const [{ isOver }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; handlerId: Identifier | null }
  >({
    accept: ITEM_TYPE,
    hover: (item: DragItem) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // 같은 위치면 무시
      if (dragIndex === hoverIndex) {
        return;
      }

      // 아이템 이동
      moveItem(dragIndex, hoverIndex);

      // 드래그 아이템의 인덱스 업데이트
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      handlerId: monitor.getHandlerId(),
    }),
  });

  // ref에 drag와 drop 연결
  drag(drop(ref));

  return (
    <div ref={ref}>
      <Card
        className={cn(
          "p-4 cursor-move transition-all",
          isDragging && "opacity-50 rotate-2",
          isOver && "ring-2 ring-blue-500",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="flex items-start gap-3">
          {/* 드래그 핸들 */}
          <div className="flex-shrink-0 mt-1">
            <GripVertical
              className={cn(
                "w-5 h-5 text-gray-400",
                !disabled && "hover:text-gray-600",
              )}
            />
          </div>

          {/* 순번 */}
          <div className="flex-shrink-0 w-8 text-center">
            <span className="text-lg font-semibold text-gray-700">
              {index + 1}
            </span>
          </div>

          {/* 공연 정보 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 truncate">
              {performance.title}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
