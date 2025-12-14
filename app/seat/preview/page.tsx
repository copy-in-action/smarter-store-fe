"use client";

import { useState } from "react";
import {
  SeatChart,
  type SeatChartConfig,
  type SeatPosition,
} from "@/shared/lib/seat";

/**
 * 좌석 배치도 미리보기 전용 페이지
 * 모바일 테스트를 위한 간단한 버전
 */
const PreviewPage = () => {
  /**
   * 기본 설정 데이터
   */
  const defaultConfig: SeatChartConfig = {
    rows: 10,
    columns: 20,
    mode: "view", // 예약 모드로 설정
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
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 18 },
      { row: 1, col: 19 },
      { row: 2, col: 0 },
      { row: 2, col: 19 },
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

  const [config, setConfig] = useState<SeatChartConfig>(defaultConfig);

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
      isSeatInArray(config.disabledSeats, row, col) ||
      isSeatInArray(config.reservedSeats, row, col) ||
      isSeatInArray(config.pendingSeats, row, col)
    ) {
      return;
    }

    /**
     * 선택된 좌석이면 해제, 아니면 선택
     */
    const isSelected = isSeatInArray(config.selectedSeats, row, col);
    const newSelectedSeats = isSelected
      ? config.selectedSeats.filter(
          (seat) => !(seat.row === row && seat.col === col),
        )
      : [...config.selectedSeats, { row, col }];

    setConfig({
      ...config,
      selectedSeats: newSelectedSeats,
    });
  };

  return (
    <div className="bg-gray-50 p-2 sm:p-4">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          좌석 배치도 미리보기
        </h1>
        <p className="text-sm text-gray-600">모바일 테스트용 간소화 버전</p>
      </div>

      {/* 좌석 차트 */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4 overflow-auto">
        <SeatChart config={config} onSeatClick={handleSeatClick} />
      </div>

      {/* 선택된 좌석 요약 (모바일에 최적화) */}
      {config.selectedSeats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            선택된 좌석 ({config.selectedSeats.length}석)
          </h3>
          <div className="flex flex-wrap gap-1">
            {config.selectedSeats.map((seat) => (
              <span
                key={`${seat.row}-${seat.col}`}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border"
              >
                {seat.row + 1}행 {seat.col + 1}열
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;
