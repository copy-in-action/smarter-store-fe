/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client";

import { useState } from "react";
import { PRESET_COLORS } from "../constants/seatChart.constants";
import type {
  SeatChartConfig,
  SeatChartMode,
  SeatGradeConfig,
  SeatType,
} from "../types/seatLayout.types";
import {
  seatPositionToString,
  validateSeatPosition,
} from "../utils/seatChart.utils";

/**
 * 좌석 설정 컴포넌트 Props
 */
interface SeatConfigProps {
  /** 초기 설정 데이터 */
  initialConfig: SeatChartConfig;
  /** 설정 변경 시 호출되는 함수 */
  onConfigChange: (config: SeatChartConfig) => void;
}

/**
 * 좌석 설정을 관리하는 UI 컴포넌트
 */
export default function SeatConfig({
  initialConfig,
  onConfigChange,
}: SeatConfigProps) {
  const [config, setConfig] = useState<SeatChartConfig>(initialConfig);

  /**
   * 설정 업데이트 및 부모 컴포넌트에 전달
   */
  const updateConfig = (newConfig: SeatChartConfig) => {
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  /**
   * 기본 입력 필드 변경 핸들러
   */
  const handleInputChange = (field: keyof SeatChartConfig, value: number) => {
    updateConfig({ ...config, [field]: value });
  };

  /**
   * 좌석 타입 추가 핸들러
   */
  const addSeatType = () => {
    // 최대 9개 제한
    if (Object.keys(config.seatTypes).length >= 9) {
      alert("좌석 타입은 최대 9개까지만 추가할 수 있습니다.");
      return;
    }

    const newKey = `custom_${Date.now()}`;

    const newSeatType: SeatType = {
      label: "새 타입",
      cssClass: "new-type",
      price: 0,
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
    field: "disabledSeats" | "reservedSeats" | "pendingSeats" | "selectedSeats",
  ) => {
    updateConfig({
      ...config,
      [field]: [...config[field], { row: 0, col: 0 }],
    });
  };

  /**
   * 좌석 위치 배열에서 아이템 제거
   */
  const removeSeatPosition = (
    field: "disabledSeats" | "reservedSeats" | "pendingSeats" | "selectedSeats",
    index: number,
  ) => {
    const newArray = config[field].filter((_, i) => i !== index);
    updateConfig({ ...config, [field]: newArray });
  };

  /**
   * 좌석 위치 업데이트
   */
  const updateSeatPosition = (
    field: "disabledSeats" | "reservedSeats" | "pendingSeats" | "selectedSeats",
    index: number,
    value: string,
  ) => {
    const [row, col] = value.split(",").map(Number);
    const newArray = [...config[field]];
    newArray[index] = { row, col };
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
            <div key={key} className="flex items-center gap-2">
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
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{
                    backgroundColor:
                      PRESET_COLORS[Object.keys(config.seatTypes).indexOf(key)]
                        ?.value || PRESET_COLORS[0].value,
                  }}
                  title={`색상: ${PRESET_COLORS[Object.keys(config.seatTypes).indexOf(key)]?.value || PRESET_COLORS[0].value}`}
                />
                <span className="text-xs text-gray-600">
                  {PRESET_COLORS[Object.keys(config.seatTypes).indexOf(key)]
                    ?.value || PRESET_COLORS[0].value}
                </span>
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
              key={grade.seatTypeKey + grade.position}
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
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
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
          {config.disabledSeats.map((seat, index) => {
            const seatString = seatPositionToString(seat);
            return (
              <div key={seatString} className="flex items-center gap-2">
                <input
                  type="text"
                  value={seatString}
                  onChange={(e) =>
                    updateSeatPosition("disabledSeats", index, e.target.value)
                  }
                  className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !validateSeatPosition(seatString, config)
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
            );
          })}
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
          {config.reservedSeats.map((seat, index) => {
            const seatString = seatPositionToString(seat);
            return (
              <div key={seatString} className="flex items-center gap-2">
                <input
                  type="text"
                  value={seatString}
                  onChange={(e) =>
                    updateSeatPosition("reservedSeats", index, e.target.value)
                  }
                  className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !validateSeatPosition(seatString, config)
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
            );
          })}
        </div>
      </div>

      {/* 구매 진행 중 좌석 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              구매 진행 중 좌석 (pendingSeats)
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              "행,열" 형식으로 입력 (예: 0,4)
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSeatPosition("pendingSeats")}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {config.pendingSeats.map((seat, index) => {
            const seatString = seatPositionToString(seat);
            return (
              <div key={seatString} className="flex items-center gap-2">
                <input
                  type="text"
                  value={seatString}
                  onChange={(e) =>
                    updateSeatPosition("pendingSeats", index, e.target.value)
                  }
                  className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !validateSeatPosition(seatString, config)
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0,0"
                />
                <button
                  type="button"
                  onClick={() => removeSeatPosition("pendingSeats", index)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  -
                </button>
              </div>
            );
          })}
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
          {config.selectedSeats.map((seat, index) => {
            const seatString = seatPositionToString(seat);
            return (
              <div key={seatString} className="flex items-center gap-2">
                <input
                  type="text"
                  value={seatString}
                  onChange={(e) =>
                    updateSeatPosition("selectedSeats", index, e.target.value)
                  }
                  className={`flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !validateSeatPosition(seatString, config)
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
            );
          })}
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
