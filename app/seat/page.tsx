"use client";

import { useState } from "react";
import {
  PRESET_COLORS,
  SeatChart,
  type SeatChartConfig,
  SeatConfig,
  type SeatPosition,
} from "@/shared/lib/seat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

/**
 * 좌석 배치도 메인 페이지
 */
const page = () => {
  /**
   * 기본 설정 데이터 (주석에 있던 샘플 코드 기반)
   */
  const defaultConfig: SeatChartConfig = {
    rows: 10,
    columns: 20,
    mode: "edit",
    seatTypes: {
      R: {
        label: "R석",
        cssClass: "economy",
        price: 190000,
      },
      S: {
        label: "S석",
        cssClass: "economy",
        price: 160000,
      },
      A: {
        label: "A석",
        cssClass: "economy",
        price: 130000,
      },
      B: {
        label: "B석",
        cssClass: "economy",
        price: 90000,
      },
    },
    seatGrades: [
      {
        seatTypeKey: "R",
        position: "0:",
      },
      {
        seatTypeKey: "R",
        position: "1:",
      },
      {
        seatTypeKey: "S",
        position: "2:",
      },
      {
        seatTypeKey: "S",
        position: "3:",
      },
      {
        seatTypeKey: "S",
        position: "4:",
      },
      {
        seatTypeKey: "A",
        position: "5:",
      },
      {
        seatTypeKey: "A",
        position: "6:",
      },
    ],
    disabledSeats: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 17 },
      { row: 0, col: 18 },
      { row: 0, col: 19 },
      //2행
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 18 },
      { row: 1, col: 19 },
      //3행
      { row: 2, col: 0 },
      { row: 2, col: 19 },
      //카메라
      { row: 5, col: 9 },
      { row: 5, col: 10 },
      { row: 6, col: 9 },
      { row: 6, col: 10 },
    ],
    reservedSeats: [
      { row: 0, col: 5 },
      { row: 0, col: 6 },
      { row: 0, col: 7 },
      { row: 1, col: 7 },
      { row: 1, col: 8 },
      { row: 2, col: 10 },
      { row: 2, col: 11 },
    ],
    pendingSeats: [
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
      { row: 0, col: 10 },
      { row: 0, col: 11 },
      { row: 2, col: 15 },
      { row: 3, col: 15 },
      { row: 4, col: 15 },
    ],
    selectedSeats: [],
    rowSpacers: [2, 8],
    columnSpacers: [5, 15],
  };

  const [formConfig, setFormConfig] = useState<SeatChartConfig>(defaultConfig);

  // 이제 formConfig가 이미 SeatChartConfig 타입이므로 변환 불필요

  /**
   * 설정 변경 핸들러 - 선택된 좌석 보존
   */
  const handleConfigChange = (newConfig: SeatChartConfig) => {
    setFormConfig((prevConfig) => ({
      ...newConfig,
      selectedSeats: prevConfig.selectedSeats, // 선택된 좌석 보존
    }));
  };

  /**
   * 좌석 클릭 핸들러 - 선택/해제 토글
   * @param row - 행 번호
   * @param col - 열 번호
   */
  const handleSeatClick = (row: number, col: number) => {
    /**
     * 좌석 위치가 배열에 있는지 확인하는 헬퍼 함수
     */
    const isSeatInArray = (
      seats: SeatPosition[],
      targetRow: number,
      targetCol: number,
    ) => {
      return seats.some(
        (seat) => seat.row === targetRow && seat.col === targetCol,
      );
    };

    /**
     * 클릭 불가능한 좌석들 체크
     * - 비활성화된 좌석
     * - 예약된 좌석
     * - 구매 진행 중인 좌석
     */
    if (
      isSeatInArray(formConfig.disabledSeats, row, col) ||
      isSeatInArray(formConfig.reservedSeats, row, col) ||
      isSeatInArray(formConfig.pendingSeats, row, col)
    ) {
      return;
    }

    /**
     * 선택된 좌석이면 해제, 아니면 선택
     */
    const isSelected = isSeatInArray(formConfig.selectedSeats, row, col);
    const newSelectedSeats = isSelected
      ? formConfig.selectedSeats.filter(
          (seat) => !(seat.row === row && seat.col === col),
        )
      : [...formConfig.selectedSeats, { row, col }];

    setFormConfig({
      ...formConfig,
      selectedSeats: newSelectedSeats,
    });
  };

  /**
   * 좌석의 등급을 결정하는 함수
   * @param row - 행 번호
   * @param col - 열 번호
   * @returns 좌석 타입 키
   */
  const getSeatType = (row: number, col: number) => {
    // 먼저 seatGrades 설정을 확인
    for (const grade of formConfig.seatGrades || []) {
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

    return "default";
  };

  /**
   * 선택된 좌석을 등급별로 그룹화
   */
  const getSelectedSeatsByType = () => {
    const seatsByType: Record<
      string,
      Array<{ row: number; col: number; position: string }>
    > = {};

    formConfig.selectedSeats.forEach((seat) => {
      const seatType = getSeatType(seat.row, seat.col);

      if (!seatsByType[seatType]) {
        seatsByType[seatType] = [];
      }

      seatsByType[seatType].push({
        row: seat.row,
        col: seat.col,
        position: `${seat.row + 1}행 ${seat.col + 1}열`,
      });
    });

    // 각 그룹 내에서 행-열 순으로 정렬
    Object.keys(seatsByType).forEach((type) => {
      seatsByType[type].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
    });

    return seatsByType;
  };

  // formConfig가 이미 SeatChartConfig 타입
  const seatChartConfig = formConfig;
  const selectedSeatsByType = getSelectedSeatsByType();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            좌석 배치도 라이브러리
          </h1>
          <p className="text-gray-600">
            좌석 설정을 변경하면 실시간으로 미리보기가 업데이트됩니다
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* 설정 패널 */}
          <div className="order-2 xl:order-1 max-w-[500px]">
            <Accordion
              type="multiple"
              defaultValue={["config", "info"]}
              className="space-y-4"
            >
              {/* 좌석 차트 설정 */}
              <AccordionItem
                value="config"
                className="bg-white border border-gray-200 rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
                  좌석 차트 설정
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <SeatConfig
                    initialConfig={formConfig}
                    onConfigChange={handleConfigChange}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 현재 설정 정보 */}
              <AccordionItem
                value="info"
                className="bg-white border border-gray-200 rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
                  현재 설정 정보
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* 기본 통계 정보 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          전체 좌석:
                        </span>{" "}
                        <span className="text-gray-900">
                          {seatChartConfig.rows * seatChartConfig.columns}석
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          좌석 타입 수:
                        </span>{" "}
                        <span className="text-gray-900">
                          {Object.keys(seatChartConfig.seatTypes).length}개
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          비활성화:
                        </span>{" "}
                        <span className="text-gray-900">
                          {seatChartConfig.disabledSeats.length}석
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          예약됨:
                        </span>{" "}
                        <span className="text-gray-900">
                          {seatChartConfig.reservedSeats.length}석
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          구매 진행 중:
                        </span>{" "}
                        <span className="text-gray-900">
                          {seatChartConfig.pendingSeats.length}석
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          사용 가능:
                        </span>{" "}
                        <span className="text-gray-900">
                          {seatChartConfig.rows * seatChartConfig.columns -
                            seatChartConfig.disabledSeats.length -
                            seatChartConfig.reservedSeats.length -
                            seatChartConfig.pendingSeats.length}
                          석
                        </span>
                      </div>
                    </div>

                    {/* 선택된 좌석 정보 */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">
                          선택된 좌석:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {seatChartConfig.selectedSeats.length}석
                        </span>
                      </div>

                      {seatChartConfig.selectedSeats.length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(selectedSeatsByType).map(
                            ([seatTypeKey, seats], index) => {
                              const seatType =
                                formConfig.seatTypes[seatTypeKey];
                              const totalPrice =
                                seats.length * (seatType?.price || 0);
                              const seatTypeIndex = Object.keys(
                                formConfig.seatTypes,
                              ).indexOf(seatTypeKey);
                              const baseColor =
                                PRESET_COLORS[seatTypeIndex]?.value ||
                                PRESET_COLORS[0].value;

                              return (
                                <div
                                  key={seatTypeKey}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded border"
                                        style={{
                                          backgroundColor: `${baseColor}33`,
                                          borderColor: baseColor,
                                        }}
                                      ></div>
                                      <span className="font-medium text-sm">
                                        {seatType?.label || "기본"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({seats.length}석)
                                      </span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600">
                                      {totalPrice.toLocaleString()}원
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {seats.map((seat) => (
                                      <span
                                        key={`${seat.col}-${seat.row}`}
                                        className="inline-block px-2 py-1 bg-white text-xs rounded border text-gray-700"
                                      >
                                        {seat.position}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            },
                          )}

                          {/* 총 합계 */}
                          <div className="border-t pt-3 flex justify-between items-center font-semibold">
                            <span>총 합계:</span>
                            <span className="text-blue-600 text-lg">
                              {Object.entries(selectedSeatsByType)
                                .reduce((total, [seatTypeKey, seats]) => {
                                  const seatType =
                                    formConfig.seatTypes[seatTypeKey];
                                  return (
                                    total +
                                    seats.length * (seatType?.price || 0)
                                  );
                                }, 0)
                                .toLocaleString()}
                              원
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          선택된 좌석이 없습니다
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* 미리보기 패널 */}
          <div className="order-1 xl:order-1 xl:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">미리보기</h2>
              <SeatChart
                config={seatChartConfig}
                onSeatClick={handleSeatClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
