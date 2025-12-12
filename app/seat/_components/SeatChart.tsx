/**
 * - 비활성화 색 변경 마무리
- 미리보기 페이지 만들어서 미리보기만 랜더링 확인(모바일도)
- 구매 진행 중 패널 추가


- 서버 인터페이스 점검
  - 추가 (모드 edit)
     - 기본 데이터 JSON
     - 예약, 선택 좌석 데이터 필요 없음
     - 연결된 공연장이 있을 경우 수정 불가 처리
   - 예매 (모드 view)
     - 예약된 좌석, 구매 진행 중 좌석 sse 처리

 */

import type { SeatChartConfig } from "../_types/seatChart.types";

/**
 * 미리 정의된 좌석 등급 색상 맵
 */
const COLOR_MAP: Record<string, { light: string; dark: string }> = {
  "#3B82F6": { light: "#DBEAFE", dark: "#1E40AF" }, // 블루
  "#10B981": { light: "#D1FAE5", dark: "#047857" }, // 그린
  "#8B5CF6": { light: "#EDE9FE", dark: "#5B21B6" }, // 퍼플
  "#F59E0B": { light: "#FEF3C7", dark: "#D97706" }, // 오렌지
  "#F43F5E": { light: "#FFE4E6", dark: "#BE123C" }, // 로즈
  "#6366F1": { light: "#E0E7FF", dark: "#3730A3" }, // 인디고
  "#06B6D4": { light: "#CFFAFE", dark: "#0E7490" }, // 시안
  "#84CC16": { light: "#ECFCCB", dark: "#365314" }, // 라임
  "#14B8A6": { light: "#CCFBF1", dark: "#0F766E" }, // 틸
  "#EC4899": { light: "#FCE7F3", dark: "#BE185D" }, // 핑크
};

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
 * 좌석 차트를 렌더링하는 컴포넌트
 */
const SeatChart = ({ config, onSeatClick }: SeatChartProps) => {
  /**
   * 좌석이 특정 상태인지 확인
   */
  const isSeatInState = (
    row: number,
    col: number,
    seats: Array<{ row: number; col: number }>,
  ) => {
    return seats.some((seat) => seat.row === row && seat.col === col);
  };

  /**
   * 좌석의 타입을 결정
   */
  const getSeatType = (row: number, col: number) => {
    // 먼저 seatGrades 설정을 확인
    for (const grade of config.seatGrades || []) {
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

    // 기존 seatRows 방식도 지원 (하위 호환성)
    for (const [key, seatType] of Object.entries(config.seatTypes)) {
      if (seatType.seatRows && seatType.seatRows.includes(row)) {
        return key;
      }
    }

    return "default";
  };

  /**
   * 좌석 상태와 타입에 따른 스타일 반환
   */
  const getSeatStyle = (row: number, col: number) => {
    const seatType = getSeatType(row, col);
    const seatTypeConfig = config.seatTypes[seatType];
    const baseColor = seatTypeConfig?.color || "#22c55e";

    const isDisabled = isSeatInState(row, col, config.disabledSeats);

    /**
     * view 모드에서 비활성화된 좌석만 투명하게 처리
     * - 영역은 유지하되 시각적으로 보이지 않음
     * - 다른 상태(예약됨, 선택됨)는 정상 표시
     */
    if (config.mode === "view" && isDisabled) {
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: "transparent",
      };
    }

    // 좌석 상태에 따른 스타일
    if (isDisabled) {
      return {
        backgroundColor: "#9ca3af",
        borderColor: "#6b7280",
        color: "#374151",
      };
    } else if (isSeatInState(row, col, config.reservedSeats)) {
      return {
        backgroundColor: "#f5f5f5",
        borderColor: "#bdbdbd",
        color: "#9e9e9e",
      };
    } else if (isSeatInState(row, col, config.pendingSeats)) {
      return {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        color: "#92400e",
      };
    } else if (isSeatInState(row, col, config.selectedSeats)) {
      // 선택된 좌석 - 등급 색상의 진한 버전으로 표시
      const colorInfo = COLOR_MAP[baseColor];
      if (colorInfo) {
        return {
          backgroundColor: colorInfo.dark,
          borderColor: colorInfo.dark,
          borderWidth: "2px",
          color: "white",
        };
      } else {
        // fallback - 기존 방식
        const lightColor = hexToRgba(baseColor, 0.2);
        return {
          backgroundColor: lightColor,
          borderColor: "#2196f3",
          borderWidth: "2px",
          color: darkenColor(baseColor, 0.6),
        };
      }
    } else {
      // 선택 가능한 좌석 - 등급 색상 적용
      const colorInfo = COLOR_MAP[baseColor];
      if (colorInfo) {
        return {
          backgroundColor: colorInfo.light,
          borderColor: baseColor,
          color: colorInfo.dark,
        };
      } else {
        // fallback - 기존 방식
        const lightColor = hexToRgba(baseColor, 0.2);
        return {
          backgroundColor: lightColor,
          borderColor: baseColor,
          color: darkenColor(baseColor, 0.6),
        };
      }
    }
  };

  /**
   * 좌석 상태에 따른 CSS 클래스 반환
   */
  const getSeatClassName = (row: number, col: number) => {
    const baseClasses =
      "w-8 h-8 flex items-center justify-center rounded-md border text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 relative";

    const isDisabled = isSeatInState(row, col, config.disabledSeats);
    const isReserved = isSeatInState(row, col, config.reservedSeats);
    const isPending = isSeatInState(row, col, config.pendingSeats);

    let cursorClass = "";
    /**
     * view 모드에서 비활성화 좌석은 마우스 이벤트 비활성화
     */
    if (config.mode === "view" && isDisabled) {
      cursorClass = "cursor-default hover:scale-100 pointer-events-none";
    } else if (isDisabled || isReserved || isPending) {
      cursorClass = "cursor-not-allowed hover:scale-100";
    }

    return `${baseClasses} ${cursorClass}`.trim();
  };

  /**
   * hex 색상을 rgba로 변환
   */
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  /**
   * 색상을 어둡게 만들기
   */
  const darkenColor = (hex: string, factor: number) => {
    const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
    const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
    const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  /**
   * 좌석 상태 텍스트 반환
   */
  const getSeatStatusText = (row: number, col: number) => {
    if (isSeatInState(row, col, config.disabledSeats)) {
      return "비활성화";
    } else if (isSeatInState(row, col, config.reservedSeats)) {
      return "예약됨";
    } else if (isSeatInState(row, col, config.pendingSeats)) {
      return "구매 진행 중";
    } else if (isSeatInState(row, col, config.selectedSeats)) {
      return "선택됨";
    } else {
      return "선택 가능";
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

      const seatType = getSeatType(rowIndex, colIndex);
      const seatTypeConfig = config.seatTypes[seatType];
      const seatStatus = getSeatStatusText(rowIndex, colIndex);
      const isDisabled = isSeatInState(
        rowIndex,
        colIndex,
        config.disabledSeats,
      );

      /**
       * 툴팁 표시 조건:
       * - edit 모드: 모든 좌석에 툴팁 표시
       * - view 모드: 비활성화 좌석에만 툴팁 비활성화, 다른 좌석은 정상 표시
       */
      const shouldShowTooltip =
        config.mode === "edit" || (config.mode === "view" && !isDisabled);
      const groupClass = shouldShowTooltip ? "group" : "";

      /**
       * 좌석 클릭 핸들러
       * - view 모드의 비활성화 좌석은 클릭 불가
       * - 비활성화/예약된 좌석은 클릭 불가
       */
      const handleClick = () => {
        if (!onSeatClick) return;

        // view 모드의 비활성화 좌석은 클릭 불가
        if (config.mode === "view" && isDisabled) return;

        // 비활성화되거나 예약된 좌석, 구매 진행 중 좌석은 클릭 불가
        if (
          isDisabled ||
          isSeatInState(rowIndex, colIndex, config.reservedSeats) ||
          isSeatInState(rowIndex, colIndex, config.pendingSeats)
        )
          return;

        onSeatClick(rowIndex, colIndex);
      };

      seats.push(
        // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`${getSeatClassName(rowIndex, colIndex)} ${groupClass}`}
          style={getSeatStyle(rowIndex, colIndex)}
          data-row={rowIndex}
          data-col={colIndex}
          onClick={handleClick}
        >
          {config.mode === "view" && isDisabled ? "" : colIndex + 1}

          {/* 툴팁 - edit 모드 또는 view 모드의 활성화 좌석에서 표시 */}
          {shouldShowTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div>
                좌표: ({rowIndex + 1}, {colIndex + 1})
              </div>
              <div>등급: {seatTypeConfig?.label || "기본"}</div>
              <div>금액: {seatTypeConfig?.price.toLocaleString() || 0}원</div>
              <div>상태: {seatStatus}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
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
  for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
    // 행 간격 추가
    if (config.rowSpacers.includes(rowIndex) && rowIndex > 0) {
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
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
              <span>선택 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 rounded"></div>
              <span>선택됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
              <span>예약됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
              <span>구매 진행 중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
              <span>비활성화</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">좌석 등급</h4>
          <div className="flex gap-6 text-sm flex-wrap">
            {Object.entries(config.seatTypes).map(([key, seatType]) => {
              const colorInfo = COLOR_MAP[seatType.color];
              return (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor:
                        colorInfo?.light || hexToRgba(seatType.color, 0.3),
                      borderColor: seatType.color,
                    }}
                  ></div>
                  <span>{seatType.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6">{rows}</div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-sm">좌석 타입별 가격</h4>
        <div className="flex gap-4 text-sm flex-wrap">
          {Object.entries(config.seatTypes).map(([key, seatType]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-medium">{seatType.label}:</span>
              <span className="text-gray-700">
                {seatType.price.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatChart;
