"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PRESET_COLORS } from "../constants/seatChart.constants";
import type {
  SeatChartConfig,
} from "../types/seatLayout.types";
import { getSeatType } from "../utils/seatChart.utils";
import SeatChart from "./SeatChart";

/**
 * 3단계 최종 뷰 컴포넌트 속성
 */
interface Step3FinalViewProps {
  /** 완성된 좌석 차트 설정 */
  seatChartConfig: SeatChartConfig;
  /** 이전 단계로 이동 핸들러 */
  onPrevious: () => void;
  /** 완료 핸들러 */
  onComplete?: (finalConfig: SeatChartConfig) => void;
}

/**
 * 3단계: 완성된 좌석 차트를 view 모드로 보여주는 컴포넌트
 */
export function Step3FinalView({
  seatChartConfig,
  onPrevious,
  onComplete,
}: Step3FinalViewProps) {
  const [finalConfig, setFinalConfig] = useState<SeatChartConfig>(seatChartConfig);

  /**
   * 좌석 클릭 핸들러 - 선택/해제 토글
   */
  const handleSeatClick = (row: number, col: number) => {
    /**
     * 좌석이 배열에 있는지 확인하는 헬퍼 함수
     */
    const isSeatInArray = (
      seats: { row: number; col: number }[],
      targetRow: number,
      targetCol: number,
    ) => {
      return seats.some(
        (seat) => seat.row === targetRow && seat.col === targetCol,
      );
    };

    // 클릭 불가능한 좌석들 체크
    if (
      isSeatInArray(finalConfig.disabledSeats, row, col) ||
      isSeatInArray(finalConfig.reservedSeats, row, col) ||
      isSeatInArray(finalConfig.pendingSeats, row, col)
    ) {
      return;
    }

    // 선택된 좌석이면 해제, 아니면 선택
    const isSelected = isSeatInArray(finalConfig.selectedSeats, row, col);
    const newSelectedSeats = isSelected
      ? finalConfig.selectedSeats.filter(
          (seat) => !(seat.row === row && seat.col === col),
        )
      : [...finalConfig.selectedSeats, { row, col }];

    setFinalConfig({
      ...finalConfig,
      selectedSeats: newSelectedSeats,
    });
  };

  /**
   * 선택된 좌석을 등급별로 그룹화
   */
  const getSelectedSeatsByType = () => {
    const seatsByType: Record<
      string,
      Array<{ row: number; col: number; position: string }>
    > = {};

    finalConfig.selectedSeats.forEach((seat) => {
      const seatType = getSeatType(seat.row, seat.col, finalConfig);

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

  const selectedSeatsByType = getSelectedSeatsByType();

  /**
   * 통계 계산
   */
  const totalSeats = finalConfig.rows * finalConfig.columns;
  const availableSeats =
    totalSeats -
    finalConfig.disabledSeats.length -
    finalConfig.reservedSeats.length -
    finalConfig.pendingSeats.length;

  return (
    <div className="space-y-6">
      {/* 설정 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>좌석 배치도 완료</CardTitle>
          <p className="text-sm text-gray-600">
            좌석을 클릭하여 예매 체험을 해보세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">전체 좌석:</span>{" "}
              <span className="text-gray-900">{totalSeats}석</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">사용 가능:</span>{" "}
              <span className="text-gray-900">{availableSeats}석</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">예약됨:</span>{" "}
              <span className="text-gray-900">
                {finalConfig.reservedSeats.length}석
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">선택됨:</span>{" "}
              <span className="text-gray-900">
                {finalConfig.selectedSeats.length}석
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* 선택된 좌석 정보 */}
        <div className="order-2 xl:order-1 max-w-[500px]">
          <Card>
            <CardHeader>
              <CardTitle>선택된 좌석</CardTitle>
            </CardHeader>
            <CardContent>
              {finalConfig.selectedSeats.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(selectedSeatsByType).map(
                    ([seatTypeKey, seats]) => {
                      const seatType = finalConfig.seatTypes[seatTypeKey];
                      const totalPrice =
                        seats.length * (seatType?.price || 0);
                      const seatTypeIndex = Object.keys(
                        finalConfig.seatTypes,
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
                          const seatType = finalConfig.seatTypes[seatTypeKey];
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
                  좌석을 선택해주세요
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 좌석 차트 */}
        <div className="order-1 xl:order-1 xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>좌석 배치도</CardTitle>
            </CardHeader>
            <CardContent>
              <SeatChart config={finalConfig} onSeatClick={handleSeatClick} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          이전 단계
        </Button>
        {onComplete && (
          <Button onClick={() => onComplete(finalConfig)} className="px-8">
            설정 완료
          </Button>
        )}
      </div>
    </div>
  );
}
