/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client";

import { useState } from "react";
import type {
  SeatChartMode,
  SeatConfigFormData,
  SeatGradeConfig,
  SeatType,
} from "../_types/seatChart.types";

/**
 * 미리 정의된 좌석 등급 색상
 * 눈이 편하고 또렷한 색상들로 구성
 */
const PRESET_COLORS = [
  { name: "블루", value: "#3B82F6", light: "#DBEAFE", dark: "#1E40AF" },
  { name: "그린", value: "#10B981", light: "#D1FAE5", dark: "#047857" },
  { name: "퍼플", value: "#8B5CF6", light: "#EDE9FE", dark: "#5B21B6" },
  { name: "오렌지", value: "#F59E0B", light: "#FEF3C7", dark: "#D97706" },
  { name: "로즈", value: "#F43F5E", light: "#FFE4E6", dark: "#BE123C" },
  { name: "인디고", value: "#6366F1", light: "#E0E7FF", dark: "#3730A3" },
  { name: "시안", value: "#06B6D4", light: "#CFFAFE", dark: "#0E7490" },
  { name: "라임", value: "#84CC16", light: "#ECFCCB", dark: "#365314" },
  { name: "틸", value: "#14B8A6", light: "#CCFBF1", dark: "#0F766E" },
  { name: "핑크", value: "#EC4899", light: "#FCE7F3", dark: "#BE185D" },
] as const;

/**
 * 좌석 설정 컴포넌트 Props
 */
interface SeatConfigProps {
  /** 초기 설정 데이터 */
  initialConfig: SeatConfigFormData;
  /** 설정 변경 시 호출되는 함수 */
  onConfigChange: (config: SeatConfigFormData) => void;
}

/**
 * 좌석 설정을 관리하는 UI 컴포넌트
 */
export default function SeatConfig({
  initialConfig,
  onConfigChange,
}: SeatConfigProps) {
  const [config, setConfig] = useState<SeatConfigFormData>(initialConfig);

  /**
   * 설정 업데이트 및 부모 컴포넌트에 전달
   */
  const updateConfig = (newConfig: SeatConfigFormData) => {
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  /**
   * 기본 입력 필드 변경 핸들러
   */
  const handleInputChange = (
    field: keyof SeatConfigFormData,
    value: number,
  ) => {
    updateConfig({ ...config, [field]: value });
  };

  /**
   * 좌석 타입 추가 핸들러
   */
  const addSeatType = () => {
    // 최대 10개 제한
    if (Object.keys(config.seatTypes).length >= 10) {
      alert("좌석 타입은 최대 10개까지만 추가할 수 있습니다.");
      return;
    }

    const newKey = `custom_${Date.now()}`;
    const usedColors = Object.values(config.seatTypes).map(
      (type) => type.color,
    );
    const availableColor =
      PRESET_COLORS.find((color) => !usedColors.includes(color.value))?.value ||
      PRESET_COLORS[0].value;

    const newSeatType: SeatType = {
      label: "새 타입",
      cssClass: "new-type",
      price: 0,
      color: availableColor,
    };
    updateConfig({
      ...config,
      seatTypes: { ...config.seatTypes, [newKey]: newSeatType },
    });
  };

  /**
   * 좌석 타입 삭제 핸들러
   */
  const removeSeatType = (key: string) => {
    const { [key]: removed, ...rest } = config.seatTypes;
    updateConfig({ ...config, seatTypes: rest });
  };

  /**
   * 좌석 타입 업데이트 핸들러
   */
  const updateSeatType = (
    key: string,
    field: keyof SeatType,
    value: string | number,
  ) => {
    updateConfig({
      ...config,
      seatTypes: {
        ...config.seatTypes,
        [key]: { ...config.seatTypes[key], [field]: value },
      },
    });
  };

  /**
   * 좌석 위치 배열에 아이템 추가
   */
  const addSeatPosition = (
    field: "disabledSeats" | "reservedSeats" | "selectedSeats",
  ) => {
    updateConfig({
      ...config,
      [field]: [...config[field], "0,0"],
    });
  };

  /**
   * 좌석 위치 배열에서 아이템 제거
   */
  const removeSeatPosition = (
    field: "disabledSeats" | "reservedSeats" | "selectedSeats",
    index: number,
  ) => {
    const newArray = config[field].filter((_, i) => i !== index);
    updateConfig({ ...config, [field]: newArray });
  };

  /**
   * 좌석 위치 업데이트
   */
  const updateSeatPosition = (
    field: "disabledSeats" | "reservedSeats" | "selectedSeats",
    index: number,
    value: string,
  ) => {
    const newArray = [...config[field]];
    newArray[index] = value;
    updateConfig({ ...config, [field]: newArray });
  };

  /**
   * 간격 배열에 아이템 추가
   */
  const addSpacer = (field: "rowSpacers" | "columnSpacers") => {
    updateConfig({
      ...config,
      [field]: [...config[field], 0],
    });
  };

  /**
   * 간격 배열에서 아이템 제거
   */
  const removeSpacer = (
    field: "rowSpacers" | "columnSpacers",
    index: number,
  ) => {
    const newArray = config[field].filter((_, i) => i !== index);
    updateConfig({ ...config, [field]: newArray });
  };

  /**
   * 간격 값 업데이트
   */
  const updateSpacer = (
    field: "rowSpacers" | "columnSpacers",
    index: number,
    value: number,
  ) => {
    const newArray = [...config[field]];
    newArray[index] = value;
    updateConfig({ ...config, [field]: newArray });
  };

  /**
   * 좌석 등급 추가 핸들러
   */
  const addSeatGrade = () => {
    const firstSeatTypeKey = Object.keys(config.seatTypes)[0] || "default";
    const newSeatGrade: SeatGradeConfig = {
      seatTypeKey: firstSeatTypeKey,
      position: "0:",
    };
    updateConfig({
      ...config,
      seatGrades: [...config.seatGrades, newSeatGrade],
    });
  };

  /**
   * 좌석 등급 제거 핸들러
   */
  const removeSeatGrade = (index: number) => {
    const newArray = config.seatGrades.filter((_, i) => i !== index);
    updateConfig({ ...config, seatGrades: newArray });
  };

  /**
   * 좌석 등급 업데이트 핸들러
   */
  const updateSeatGrade = (
    index: number,
    field: keyof SeatGradeConfig,
    value: string,
  ) => {
    const newArray = [...config.seatGrades];
    newArray[index] = { ...newArray[index], [field]: value };
    updateConfig({ ...config, seatGrades: newArray });
  };

  /**
   * 모드 토글 핸들러
   */
  const toggleMode = () => {
    const newMode: SeatChartMode = config.mode === "edit" ? "view" : "edit";
    updateConfig({ ...config, mode: newMode });
  };

  /**
   * 좌석 위치 문자열 유효성 검사
   */
  const validateSeatPosition = (position: string): boolean => {
    const [row, col] = position.split(",").map(Number);
    return (
      !isNaN(row) &&
      !isNaN(col) &&
      row >= 0 &&
      col >= 0 &&
      row < config.rows &&
      col < config.columns
    );
  };

  return (
    <div className="space-y-6 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">좌석 차트 설정</h2>

        {/* 모드 토글 버튼 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">모드:</span>
          <button
            type="button"
            onClick={toggleMode}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors duration-200 ${
              config.mode === "edit"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {config.mode === "edit" ? "편집" : "보기"}
          </button>
          <div className="text-xs text-gray-500">
            {config.mode === "edit" ? "설정 변경 가능" : "미리보기 모드"}
          </div>
        </div>
      </div>

      {/* 기본 설정 */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800">기본 설정</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              행 수 (rows)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.rows}
              onChange={(e) =>
                handleInputChange("rows", Number(e.target.value))
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              열 수 (columns)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.columns}
              onChange={(e) =>
                handleInputChange("columns", Number(e.target.value))
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 좌석 타입 설정 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              좌석 타입 (seatTypes)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              각 좌석 타입별 라벨, CSS 클래스, 가격을 설정
            </p>
          </div>
          <button
            type="button"
            onClick={addSeatType}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(config.seatTypes).map(([key, seatType]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <input
                type="text"
                placeholder="라벨"
                value={seatType.label}
                onChange={(e) => updateSeatType(key, "label", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="CSS 클래스"
                value={seatType.cssClass}
                onChange={(e) =>
                  updateSeatType(key, "cssClass", e.target.value)
                }
                className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="가격"
                value={seatType.price}
                onChange={(e) =>
                  updateSeatType(key, "price", Number(e.target.value))
                }
                className="w-20 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1">
                <select
                  value={seatType.color}
                  onChange={(e) => updateSeatType(key, "color", e.target.value)}
                  className="w-24 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PRESET_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: seatType.color }}
                  title={`색상: ${seatType.color}`}
                />
              </div>
              {key !== "default" && (
                <button
                  type="button"
                  onClick={() => removeSeatType(key)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 좌석 등급 설정 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              좌석 등급 설정 (seatGrades)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              좌석 타입을 특정 행/열에 적용
              <br />
              ("3:" = 3행 전체, ":5" = 5열 전체, "3:5" = 3행 5열)
            </p>
          </div>
          <button
            type="button"
            onClick={addSeatGrade}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="space-y-2">
          {config.seatGrades.map((grade, index) => (
            <div
              key={grade.seatTypeKey}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <select
                value={grade.seatTypeKey}
                onChange={(e) =>
                  updateSeatGrade(index, "seatTypeKey", e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(config.seatTypes).map(([key, seatType]) => (
                  <option key={key} value={key}>
                    {seatType.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="행:열 (예: 3:, :5, 3:5)"
                value={grade.position}
                onChange={(e) =>
                  updateSeatGrade(index, "position", e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeSeatGrade(index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
          {config.seatGrades.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              등급 설정이 없습니다. 위의 "추가" 버튼을 눌러 좌석 등급을
              설정하세요.
            </div>
          )}
        </div>
      </div>

      {/* 비활성화된 좌석 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              비활성화된 좌석 (disabledSeats)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              "행,열" 형식으로 입력 (예: 0,9)
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSeatPosition("disabledSeats")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.disabledSeats.map((seat, index) => (
            <div key={seat} className="flex items-center gap-2">
              <input
                type="text"
                value={seat}
                onChange={(e) =>
                  updateSeatPosition("disabledSeats", index, e.target.value)
                }
                className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !validateSeatPosition(seat)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0,0"
              />
              <button
                type="button"
                onClick={() => removeSeatPosition("disabledSeats", index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 예약된 좌석 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              예약된 좌석 (reservedSeats)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              "행,열" 형식으로 입력 (예: 0,3)
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSeatPosition("reservedSeats")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.reservedSeats.map((seat, index) => (
            <div key={seat} className="flex items-center gap-2">
              <input
                type="text"
                value={seat}
                onChange={(e) =>
                  updateSeatPosition("reservedSeats", index, e.target.value)
                }
                className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !validateSeatPosition(seat)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0,0"
              />
              <button
                type="button"
                onClick={() => removeSeatPosition("reservedSeats", index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 좌석 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              선택된 좌석 (selectedSeats)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              "행,열" 형식으로 입력 (예: 0,5)
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSeatPosition("selectedSeats")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.selectedSeats.map((seat, index) => (
            <div key={seat} className="flex items-center gap-2">
              <input
                type="text"
                value={seat}
                onChange={(e) =>
                  updateSeatPosition("selectedSeats", index, e.target.value)
                }
                className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !validateSeatPosition(seat)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0,0"
              />
              <button
                type="button"
                onClick={() => removeSeatPosition("selectedSeats", index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 행 간격 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              행 간격 (rowSpacers)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              지정한 행 뒤에 여백 추가
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSpacer("rowSpacers")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.rowSpacers.map((spacer, index) => (
            <div key={spacer} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={config.rows - 1}
                value={spacer}
                onChange={(e) =>
                  updateSpacer("rowSpacers", index, Number(e.target.value))
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeSpacer("rowSpacers", index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 열 간격 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              열 간격 (columnSpacers)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              지정한 열 뒤에 여백 추가
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSpacer("columnSpacers")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.columnSpacers.map((spacer, index) => (
            <div key={spacer} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={config.columns - 1}
                value={spacer}
                onChange={(e) =>
                  updateSpacer("columnSpacers", index, Number(e.target.value))
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeSpacer("columnSpacers", index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
