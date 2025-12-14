/**
 * 예매용 좌석 차트 컴포넌트
 * 정적 배치도 + 동적 예매 상태를 결합하여 표시
 */
"use client";

import { useEffect } from "react";
import { PRESET_COLORS } from "../constants/seatChart.constants";
import { useSeatChart, useSeatStatus } from "../hooks/useSeatChart";

/**
 * 색상에 따른 스타일 맵
 */
const COLOR_MAP: Record<
  string,
  {
    background: string;
    selectedBackground: string;
    border: string;
    selectedBorder: string;
  }
> = {
  "#E53935": {
    background: "transparent",
    selectedBackground: "#E53935",
    border: "#E53935",
    selectedBorder: "#C62828",
  },
  "#1E88E5": {
    background: "transparent",
    selectedBackground: "#1E88E5",
    border: "#1E88E5",
    selectedBorder: "#1565C0",
  },
  "#43A047": {
    background: "transparent",
    selectedBackground: "#43A047",
    border: "#43A047",
    selectedBorder: "#2E7D32",
  },
  "#FB8C00": {
    background: "transparent",
    selectedBackground: "#FB8C00",
    border: "#FB8C00",
    selectedBorder: "#EF6C00",
  },
  "#8E24AA": {
    background: "transparent",
    selectedBackground: "#8E24AA",
    border: "#8E24AA",
    selectedBorder: "#6A1B9A",
  },
  "#FDD835": {
    background: "transparent",
    selectedBackground: "#FDD835",
    border: "#FDD835",
    selectedBorder: "#F9A825",
  },
  "#00ACC1": {
    background: "transparent",
    selectedBackground: "#00ACC1",
    border: "#00ACC1",
    selectedBorder: "#00838F",
  },
  "#6D4C41": {
    background: "transparent",
    selectedBackground: "#6D4C41",
    border: "#6D4C41",
    selectedBorder: "#4E342E",
  },
  "#D81B60": {
    background: "transparent",
    selectedBackground: "#D81B60",
    border: "#D81B60",
    selectedBorder: "#AD1457",
  },
};

/**
 * BookingSeatChart 컴포넌트 Props
 */
interface BookingSeatChartProps {
  /** 좌석 배치도 ID */
  venueId: string;
  /** 좌석 선택 시 호출되는 콜백 */
  onSeatSelect?: (seats: Array<{ row: number; col: number }>) => void;
}

/**
 * 예매용 좌석 차트를 렌더링하는 컴포넌트
 */
export default function BookingSeatChart({
  venueId,
  onSeatSelect,
}: BookingSeatChartProps) {
  const {
    seatChartConfig,
    isLoading,
    error,
    toggleSeatSelection,
    userSelection,
  } = useSeatChart(venueId);

  const { getSeatStatus, isSeatClickable } = useSeatStatus(seatChartConfig);

  // 선택된 좌석 변경 시 콜백 호출
  useEffect(() => {
    if (onSeatSelect) {
      onSeatSelect(userSelection.selectedSeats);
    }
  }, [userSelection.selectedSeats, onSeatSelect]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">좌석 배치도를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !seatChartConfig) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <div>좌석 배치도를 불러올 수 없습니다: {error}</div>
      </div>
    );
  }

  /**
   * 좌석의 타입을 결정
   */
  const getSeatType = (row: number, col: number) => {
    // seatGrades 설정을 확인
    for (const grade of seatChartConfig.seatGrades || []) {
      const [rowPart, colPart] = grade.position.split(":");

      // "3:" 형태 - 3행 전체
      if (rowPart && !colPart && Number(rowPart) === row) {
        return grade.seatTypeKey;
      }

      // ":5" 형태 - 5열 전체
      if (!rowPart && colPart && Number(colPart) === col) {
        return grade.seatTypeKey;
      }

      // "3:5" 형태 - 3행 5열
      if (
        rowPart &&
        colPart &&
        Number(rowPart) === row &&
        Number(colPart) === col
      ) {
        return grade.seatTypeKey;
      }
    }

    // 기본값으로 좌석타입의 마지막 인덱스 반환
    const seatTypeKeys = Object.keys(seatChartConfig.seatTypes);
    return seatTypeKeys[seatTypeKeys.length - 1] || "default";
  };

  /**
   * 좌석 상태와 타입에 따른 스타일 반환
   */
  const getSeatStyle = (row: number, col: number) => {
    const seatType = getSeatType(row, col);
    const seatTypeIndex = Object.keys(seatChartConfig.seatTypes).indexOf(
      seatType,
    );
    const baseColor = PRESET_COLORS[seatTypeIndex].value;
    const status = getSeatStatus(row, col);

    // 좌석 상태에 따른 스타일
    if (status === "disabled") {
      return {
        backgroundColor: "#9ca3af",
        borderColor: "#6b7280",
        color: "#374151",
      };
    } else if (status === "reserved") {
      return {
        backgroundColor: "#e5e7eb",
        borderColor: "#9ca3af",
        color: "#6b7280",
      };
    } else if (status === "pending") {
      return {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        color: "#92400e",
      };
    } else if (status === "selected") {
      // 선택된 좌석
      const colorInfo = COLOR_MAP[baseColor];
      return {
        backgroundColor: colorInfo.selectedBackground,
        borderColor: colorInfo.selectedBorder,
        borderWidth: "2px",
        color: "white",
      };
    } else {
      // 선택 가능한 좌석
      const colorInfo = COLOR_MAP[baseColor];
      return {
        backgroundColor: colorInfo.background,
        borderColor: colorInfo.border,
        color: baseColor,
      };
    }
  };

  /**
   * 좌석 클릭 핸들러
   */
  const handleSeatClick = (row: number, col: number) => {
    if (!isSeatClickable(row, col)) return;
    toggleSeatSelection(row, col);
  };

  /**
   * 행 렌더링
   */
  const renderRow = (rowIndex: number) => {
    const seats = [];

    for (let colIndex = 0; colIndex < seatChartConfig.columns; colIndex++) {
      // 열 간격 추가
      if (seatChartConfig.columnSpacers.includes(colIndex) && colIndex > 0) {
        seats.push(<div key={`col-spacer-${colIndex}`} className="w-5" />);
      }

      const seatStatus = getSeatStatus(rowIndex, colIndex);
      const isClickable = isSeatClickable(rowIndex, colIndex);

      seats.push(
        // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs font-medium transition-all duration-200 ${
            isClickable
              ? "cursor-pointer hover:scale-105"
              : "cursor-not-allowed"
          }`}
          style={getSeatStyle(rowIndex, colIndex)}
          onClick={() => handleSeatClick(rowIndex, colIndex)}
        >
          {seatStatus === "disabled" ? "" : colIndex + 1}
        </div>,
      );
    }

    return (
      <div key={rowIndex} className="flex items-center mb-2">
        <div className="w-10 text-center font-bold text-gray-600 text-sm">
          {rowIndex + 1}
        </div>
        <div className="flex gap-1">{seats}</div>
      </div>
    );
  };

  const rows = [];
  for (let rowIndex = 0; rowIndex < seatChartConfig.rows; rowIndex++) {
    // 행 간격 추가
    if (seatChartConfig.rowSpacers.includes(rowIndex) && rowIndex > 0) {
      rows.push(<div key={`row-spacer-${rowIndex}`} className="h-5" />);
    }

    rows.push(renderRow(rowIndex));
  }

  return (
    <div className="max-w-4xl mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50">
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
            {Object.entries(seatChartConfig.seatTypes).map(
              ([key, seatType], index) => {
                const seatColor = PRESET_COLORS[index].value;
                const colorInfo = COLOR_MAP[seatColor];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: colorInfo.background,
                        borderColor: seatColor,
                      }}
                    ></div>
                    <span>{seatType.label}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">{rows}</div>

      {/* 선택된 좌석 정보 */}
      {userSelection.selectedSeats.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-blue-800">
            선택된 좌석 ({userSelection.selectedSeats.length}석)
          </h4>
          <div className="flex gap-2 flex-wrap">
            {userSelection.selectedSeats.map((seat) => (
              <span
                key={`${seat.row}-${seat.col}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {seat.row + 1}행 {seat.col + 1}열
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
