/**
 * 좌석 차트 컴포넌트 (편집/보기 모드 지원)
 */
"use client";

import { useState } from "react";
import { PRESET_COLORS } from "../constants/seatChart.constants";
import type { SeatChartConfig } from "../types/seatLayout.types";
import { getSeatType, isSeatInState } from "../utils/seatChart.utils";

/**
 * SeatChart 컴포넌트 Props
 */
interface SeatChartProps {
  /** 좌석 차트 설정 */
  config: SeatChartConfig;
  /** 좌석 클릭 핸들러 */
  onSeatClick?: (row: number, col: number) => void;
}

/**
 * 좌석 차트를 렌더링하는 컴포넌트 (편집/보기 모드 지원)
 */
export default function SeatChart({ config, onSeatClick }: SeatChartProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  /**
   * 줌 레벨 변경 핸들러
   */
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const newZoom = prev + delta;
      return Math.max(0.5, Math.min(2, newZoom)); // 0.5x ~ 2x 제한
    });
  };

  /**
   * 줌 리셋 핸들러
   */
  const resetZoom = () => {
    setZoomLevel(1);
  };
  /**
   * 좌석 상태와 타입에 따른 스타일 반환
   */
  const getSeatStyle = (row: number, col: number) => {
    const seatType = getSeatType(row, col, config);
    const seatTypeIndex = Object.keys(config.seatTypes).indexOf(seatType);
    const baseColor =
      PRESET_COLORS[seatTypeIndex]?.value || PRESET_COLORS[0].value;

    const isDisabled = isSeatInState(row, col, config.disabledSeats);
    const isReserved = isSeatInState(row, col, config.reservedSeats);
    const isPending = isSeatInState(row, col, config.pendingSeats);
    const isSelected = isSeatInState(row, col, config.selectedSeats);

    // 좌석 상태에 따른 스타일
    if (isDisabled) {
      return {
        backgroundColor: "#9ca3af",
        borderColor: "#6b7280",
        color: "#374151",
      };
    } else if (isReserved) {
      return {
        backgroundColor: "#e5e7eb",
        borderColor: "#9ca3af",
        color: "#6b7280",
      };
    } else if (isPending) {
      return {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        color: "#92400e",
      };
    } else if (isSelected) {
      return {
        backgroundColor: baseColor,
        borderColor: baseColor,
        borderWidth: "2px",
        color: "white",
      };
    } else {
      return {
        backgroundColor: "transparent",
        borderColor: baseColor,
        color: baseColor,
      };
    }
  };

  /**
   * 행 렌더링
   */
  const renderRow = (rowIndex: number) => {
    const seats = [];

    for (let colIndex = 0; colIndex < config.columns; colIndex++) {
      // 열 간격 추가
      if (config.columnSpacers.includes(colIndex) && colIndex > 0) {
        seats.push(<div key={`col-spacer-${colIndex}`} className="w-5" />);
      }

      const isDisabled = isSeatInState(
        rowIndex,
        colIndex,
        config.disabledSeats,
      );
      const isReserved = isSeatInState(
        rowIndex,
        colIndex,
        config.reservedSeats,
      );
      const isPending = isSeatInState(rowIndex, colIndex, config.pendingSeats);

      // 보기 모드에서 비활성화된 좌석은 렌더링하지 않음
      if (config.mode === "view" && isDisabled) {
        seats.push(<div key={`${rowIndex}-${colIndex}`} className="w-8 h-8" />);
        continue;
      }

      let touchHandled = false;

      const handleTouchStart = () => {
        touchHandled = false;
      };

      const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (touchHandled) return;
        touchHandled = true;

        if (!onSeatClick) return;
        if (isDisabled || isReserved || isPending) return;
        onSeatClick(rowIndex, colIndex);
      };

      const handleClick = (e: React.MouseEvent) => {
        // 터치 이벤트가 처리되었다면 마우스 이벤트 무시
        if (touchHandled) {
          touchHandled = false;
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (!onSeatClick) return;
        if (isDisabled || isReserved || isPending) return;
        onSeatClick(rowIndex, colIndex);
      };

      const seatType = getSeatType(rowIndex, colIndex, config);
      const seatTypeInfo = config.seatTypes[seatType];

      /**
       * 좌석 상태 텍스트 반환
       */
      const getStatusText = () => {
        if (isDisabled) return "비활성화";
        if (isReserved) return "예약됨";
        if (isPending) return "구매 진행 중";
        if (isSeatInState(rowIndex, colIndex, config.selectedSeats))
          return "선택됨";
        return "선택 가능";
      };

      /**
       * 툴팁 내용 생성
       */
      const tooltipContent = [
        `좌석: ${rowIndex + 1}행 ${colIndex + 1}열`,
        `타입: ${seatTypeInfo?.label || "기본"}`,
        `가격: ${(seatTypeInfo?.price || 0).toLocaleString()}원`,
        `상태: ${getStatusText()}`,
      ].join("\n");

      seats.push(
        <button
          type="button"
          key={`${rowIndex}-${colIndex}`}
          className={`relative w-8 h-8 flex items-center justify-center rounded-md border text-xs font-medium touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            isDisabled || isReserved || isPending
              ? "cursor-not-allowed opacity-60"
              : "transition-transform duration-100 active:scale-90 md:hover:scale-105 md:group"
          }`}
          style={{
            ...getSeatStyle(rowIndex, colIndex),
            WebkitTapHighlightColor: "transparent",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={isDisabled || isReserved || isPending}
        >
          {isDisabled ? "" : colIndex + 1}

          {/* 툴팁 - 데스크톱에서만 표시 */}
          <div className="hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-pre-line opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max">
            {tooltipContent}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </button>,
      );
    }

    return (
      <div key={rowIndex} className="flex items-center mb-2">
        <div className="w-10 min-w-10 text-center font-bold text-gray-600 text-sm">
          {rowIndex + 1}
        </div>
        <div className="flex gap-1">{seats}</div>
      </div>
    );
  };

  const rows = [];
  for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
    // 행 간격 추가
    if (config.rowSpacers.includes(rowIndex) && rowIndex > 0) {
      rows.push(<div key={`row-spacer-${rowIndex}`} className="h-5" />);
    }

    rows.push(renderRow(rowIndex));
  }

  return (
    <div className="mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50">
      <div className="mb-4">
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-2">좌석 상태</h4>
          <div className="flex gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 rounded"></div>
              <span>선택됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
              <span>예약됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
              <span>구매 진행 중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
              <span>비활성화</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">좌석 등급</h4>
          <div className="flex gap-6 text-sm flex-wrap">
            {Object.entries(config.seatTypes).map(([key, seatType], index) => {
              const seatColor =
                PRESET_COLORS[index]?.value || PRESET_COLORS[0].value;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: seatColor,
                    }}
                  ></div>
                  <span>{seatType.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="mb-6 overflow-auto relative"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`,
        }}
      >
        {rows}
      </div>

      {/* 줌 컨트롤 버튼들 - 모바일에서만 표시 */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoom(0.1);
          }}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-xl font-bold touch-manipulation"
          aria-label="확대"
        >
          +
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoom(-0.1);
          }}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-xl font-bold touch-manipulation"
          aria-label="축소"
        >
          −
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetZoom();
          }}
          className="w-12 h-12 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition-colors flex items-center justify-center text-xs font-medium touch-manipulation"
          aria-label="리셋"
        >
          1x
        </button>
        <div className="text-xs text-center text-gray-600 bg-white rounded px-2 py-1 shadow">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
}
