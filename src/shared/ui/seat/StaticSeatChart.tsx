"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  SeatGrade,
  VenueSeatCapacityRequest,
} from "@/shared/api/orval/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type {
  SeatChartConfig,
  StaticSeatVenue,
} from "@/shared/lib/seat.types";
import { extractSeatGradeInfo } from "@/shared/lib/seat.converters";
import SeatChart from "./SeatChart";

interface StaticSeatChartProps {
  /** 초기 데이터 */
  initialData?: Partial<StaticSeatVenue>;
  /** 설정 변경 핸들러 */
  onDataChange: (data: StaticSeatVenue) => void;
  /** BE 저장 핸들러 (선택적) */
  onSave?: (
    data: StaticSeatVenue,
    gradeInfo: VenueSeatCapacityRequest[],
  ) => Promise<void>;
}

/**
 * 관리자 페이지에서 공연장 배치도 기본(좌석, 등급)을 설정 할 때 사용하는 컴포넌트
 */
export function StaticSeatChart({
  initialData,
  onDataChange,
  onSave,
}: StaticSeatChartProps) {
  const [formData, setFormData] = useState<StaticSeatVenue>({
    rows: initialData?.rows || 10,
    columns: initialData?.columns || 20,
    seatTypes: initialData?.seatTypes || {},
    disabledSeats: initialData?.disabledSeats || [],
    rowSpacers: initialData?.rowSpacers || [],
    columnSpacers: initialData?.columnSpacers || [],
  });

  const [isSaving, setIsSaving] = useState(false);

  /**
   * 폼 데이터 업데이트 및 부모에게 전달
   */
  const updateFormData = (newData: Partial<StaticSeatVenue>) => {
    const updated = { ...formData, ...newData };
    setFormData(updated);
    onDataChange(updated);
  };

  /**
   * 좌석 타입 추가 (SeatGrade 기준)
   */
  const addSeatType = () => {
    // 사용 가능한 등급 목록
    const availableGrades: SeatGrade[] = ["VIP", "R", "S", "A", "B"];
    const usedGrades = Object.keys(formData.seatTypes) as SeatGrade[];
    const unusedGrades = availableGrades.filter(
      (grade) => !usedGrades.includes(grade),
    );

    if (unusedGrades.length === 0) {
      console.warn("모든 좌석 등급이 이미 사용 중입니다.");
      return;
    }

    const newGrade = unusedGrades[0];
    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [newGrade]: {
          positions: [],
        },
      },
    });
  };

  /**
   * 좌석 타입 삭제
   */
  const removeSeatType = (keyToRemove: SeatGrade) => {
    const { [keyToRemove]: removed, ...remaining } = formData.seatTypes;
    updateFormData({
      seatTypes: remaining,
    });
  };

  /**
   * 좌석 타입 라벨 변경 (SeatGrade로 제한)
   */
  const updateSeatTypeLabel = (oldKey: SeatGrade, newKey: SeatGrade) => {
    const { [oldKey]: oldValue, ...rest } = formData.seatTypes;
    updateFormData({
      seatTypes: {
        ...rest,
        [newKey]: oldValue || { positions: [] },
      },
    });
  };

  /**
   * 특정 좌석 타입에 position 추가
   */
  const addPosition = (seatTypeKey: SeatGrade) => {
    const seatType = formData.seatTypes[seatTypeKey];
    if (!seatType) return;

    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [seatTypeKey]: {
          ...seatType,
          positions: [...seatType.positions, "1:"],
        },
      },
    });
  };

  /**
   * 특정 좌석 타입의 position 삭제
   */
  const removePosition = (seatTypeKey: SeatGrade, positionIndex: number) => {
    const seatType = formData.seatTypes[seatTypeKey];
    if (!seatType) return;

    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [seatTypeKey]: {
          ...seatType,
          positions: seatType.positions.filter((_, i) => i !== positionIndex),
        },
      },
    });
  };

  /**
   * 특정 좌석 타입의 position 업데이트
   */
  const updatePosition = (
    seatTypeKey: SeatGrade,
    positionIndex: number,
    value: string,
  ) => {
    const seatType = formData.seatTypes[seatTypeKey];
    if (!seatType) return;

    const updatedPositions = [...seatType.positions];
    updatedPositions[positionIndex] = value;

    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [seatTypeKey]: {
          ...seatType,
          positions: updatedPositions,
        },
      },
    });
  };

  /**
   * 유효성 검사
   */
  const isValid = () => {
    if (formData.rows <= 0 || formData.columns <= 0) return false;
    if (Object.keys(formData.seatTypes).length === 0) return false;

    // 모든 좌석 타입이 최소 하나의 position을 가지고 있는지 확인
    return Object.values(formData.seatTypes).every(
      (seatType) => seatType && seatType.positions.length > 0,
    );
  };

  /**
   * 비활성화 좌석 추가
   */
  const addDisabledSeat = () => {
    updateFormData({
      disabledSeats: [...formData.disabledSeats, { row: 0, col: 0 }],
    });
  };

  /**
   * 비활성화 좌석 삭제
   */
  const removeDisabledSeat = (index: number) => {
    updateFormData({
      disabledSeats: formData.disabledSeats.filter((_, i) => i !== index),
    });
  };

  /**
   * 비활성화 좌석 업데이트
   */
  const updateDisabledSeat = (
    index: number,
    field: "row" | "col",
    value: number,
  ) => {
    const updated = [...formData.disabledSeats];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ disabledSeats: updated });
  };

  /**
   * 행 간격 추가
   */
  const addRowSpacer = () => {
    updateFormData({
      rowSpacers: [...formData.rowSpacers, 1],
    });
  };

  /**
   * 행 간격 삭제
   */
  const removeRowSpacer = (index: number) => {
    updateFormData({
      rowSpacers: formData.rowSpacers.filter((_, i) => i !== index),
    });
  };

  /**
   * 행 간격 업데이트
   */
  const updateRowSpacer = (index: number, value: number) => {
    const updated = [...formData.rowSpacers];
    updated[index] = value;
    updateFormData({ rowSpacers: updated });
  };

  /**
   * 열 간격 추가
   */
  const addColumnSpacer = () => {
    updateFormData({
      columnSpacers: [...formData.columnSpacers, 1],
    });
  };

  /**
   * 열 간격 삭제
   */
  const removeColumnSpacer = (index: number) => {
    updateFormData({
      columnSpacers: formData.columnSpacers.filter((_, i) => i !== index),
    });
  };

  /**
   * 열 간격 업데이트
   */
  const updateColumnSpacer = (index: number, value: number) => {
    const updated = [...formData.columnSpacers];
    updated[index] = value;
    updateFormData({ columnSpacers: updated });
  };

  /**
   * BE에 데이터 저장
   */
  const handleSave = async () => {
    if (!onSave || !isValid()) return;

    setIsSaving(true);
    try {
      const gradeInfo = extractSeatGradeInfo(formData);
      await onSave(formData, gradeInfo);
    } catch (error) {
      console.error("저장 실패:", error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 등급별 좌석 수 미리보기
   */
  const getSeatGradePreview = () => {
    if (!isValid()) return [];
    return extractSeatGradeInfo(formData);
  };

  /**
   * 미리보기용 SeatChartConfig 생성
   */
  const createPreviewConfig = (): SeatChartConfig => {
    // 좌석 타입에 임시 가격(0) 추가
    const seatTypesWithDefaults = Object.fromEntries(
      Object.entries(formData.seatTypes).map(([key, seatType]) => [
        key,
        {
          ...seatType,
          price: 0, // 1단계에서는 가격 0으로 표시
        },
      ]),
    ) as Partial<Record<SeatGrade, { price: number; positions: string[] }>>;

    return {
      ...formData,
      seatTypes: seatTypesWithDefaults,
      mode: "edit",
      // 임시 예매 상태 데이터
      reservedSeats: [],
      pendingSeats: [],
      selectedSeats: [],
    };
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-6">
      {/* 설정 패널 */}
      <div className="col-span-2">
        <Accordion
          type="multiple"
          defaultValue={["basic", "seatTypes"]}
          className="space-y-4"
        >
          {/* 기본 설정 */}
          <AccordionItem
            value="basic"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              기본 설정
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rows">총 행 수</Label>
                    <Input
                      id="rows"
                      type="number"
                      value={formData.rows}
                      onChange={(e) =>
                        updateFormData({ rows: Number(e.target.value) })
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="columns">총 열 수</Label>
                    <Input
                      id="columns"
                      type="number"
                      value={formData.columns}
                      onChange={(e) =>
                        updateFormData({ columns: Number(e.target.value) })
                      }
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 좌석 타입 */}
          <AccordionItem
            value="seatTypes"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              좌석 타입
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    onClick={addSeatType}
                    size="sm"
                    disabled={Object.keys(formData.seatTypes).length >= 5}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    타입 추가 ({Object.keys(formData.seatTypes).length}/5)
                  </Button>
                </div>
                {Object.entries(formData.seatTypes).map(([key, seatType]) => (
                  <div
                    key={key}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    {/* 좌석 타입 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <Label htmlFor={`seatType-${key}`}>좌석 등급</Label>
                        <select
                          id={`seatType-${key}`}
                          value={key}
                          onChange={(e) =>
                            updateSeatTypeLabel(
                              key as SeatGrade,
                              e.target.value as SeatGrade,
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="VIP">VIP석</option>
                          <option value="R">R석</option>
                          <option value="S">S석</option>
                          <option value="A">A석</option>
                          <option value="B">B석</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => removeSeatType(key as SeatGrade)}
                        variant="outline"
                        size="sm"
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Positions 관리 */}
                    <div className="pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-gray-600">
                          좌석 위치 (예: "3:" or ":5" or "3:5")
                        </Label>
                        <Button
                          onClick={() => addPosition(key as SeatGrade)}
                          size="sm"
                          variant="ghost"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          위치 추가
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {seatType.positions.map((position, posIdx) => (
                          <div key={posIdx} className="flex items-center gap-2">
                            <Input
                              value={position}
                              onChange={(e) =>
                                updatePosition(
                                  key as SeatGrade,
                                  posIdx,
                                  e.target.value,
                                )
                              }
                              placeholder="1:, :5, 3:5 등"
                              className="flex-1"
                            />
                            <Button
                              onClick={() =>
                                removePosition(key as SeatGrade, posIdx)
                              }
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {seatType.positions.length === 0 && (
                          <p className="py-2 text-xs text-center text-gray-400">
                            위치를 추가해주세요
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(formData.seatTypes).length === 0 && (
                  <p className="py-4 text-center text-gray-500">
                    좌석 타입을 추가해주세요
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 비활성화 좌석 */}
          <AccordionItem
            value="disabledSeats"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              비활성화 좌석
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={addDisabledSeat} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    좌석 추가
                  </Button>
                </div>
                {formData.disabledSeats.map((seat, index) => (
                  <div
                    key={`${seat.col}-${seat.row}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`disabledRow-${index}`}>
                        행 번호 (1부터 시작)
                      </Label>
                      <Input
                        id={`disabledRow-${index}`}
                        type="number"
                        value={seat.row + 1}
                        onChange={(e) =>
                          updateDisabledSeat(
                            index,
                            "row",
                            Number(e.target.value) - 1,
                          )
                        }
                        min="1"
                        max={formData.rows}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`disabledCol-${index}`}>
                        열 번호 (1부터 시작)
                      </Label>
                      <Input
                        id={`disabledCol-${index}`}
                        type="number"
                        value={seat.col + 1}
                        onChange={(e) =>
                          updateDisabledSeat(
                            index,
                            "col",
                            Number(e.target.value) - 1,
                          )
                        }
                        min="1"
                        max={formData.columns}
                      />
                    </div>
                    <Button
                      onClick={() => removeDisabledSeat(index)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.disabledSeats.length === 0 && (
                  <p className="py-4 text-center text-gray-500">
                    비활성화할 좌석이 없습니다
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 행 간격 설정 */}
          <AccordionItem
            value="rowSpacers"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              행 간격 설정
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={addRowSpacer} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    간격 추가
                  </Button>
                </div>
                {formData.rowSpacers.map((spacer, index) => (
                  <div
                    key={`${spacer}-${index.toString()}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`rowSpacer-${index}`}>
                        행 번호 (이 행 뒤에 간격 추가)
                      </Label>
                      <Input
                        id={`rowSpacer-${index}`}
                        type="number"
                        value={spacer}
                        onChange={(e) =>
                          updateRowSpacer(index, Number(e.target.value))
                        }
                        min="0"
                        max={formData.rows - 1}
                      />
                    </div>
                    <Button
                      onClick={() => removeRowSpacer(index)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.rowSpacers.length === 0 && (
                  <p className="py-4 text-center text-gray-500">
                    행 간격이 설정되지 않았습니다
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 열 간격 설정 */}
          <AccordionItem
            value="columnSpacers"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              열 간격 설정
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={addColumnSpacer} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    간격 추가
                  </Button>
                </div>
                {formData.columnSpacers.map((spacer, index) => (
                  <div
                    key={`${spacer}-${index.toString()}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`columnSpacer-${index}`}>
                        열 번호 (이 열 뒤에 간격 추가)
                      </Label>
                      <Input
                        id={`columnSpacer-${index}`}
                        type="number"
                        value={spacer}
                        onChange={(e) =>
                          updateColumnSpacer(index, Number(e.target.value))
                        }
                        min="0"
                        max={formData.columns - 1}
                      />
                    </div>
                    <Button
                      onClick={() => removeColumnSpacer(index)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.columnSpacers.length === 0 && (
                  <p className="py-4 text-center text-gray-500">
                    열 간격이 설정되지 않았습니다
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={!isValid() || isSaving}
                variant="outline"
                className="px-6"
              >
                배치도 저장
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 미리보기 패널 */}
      <div className="sticky col-span-4 top-8">
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <p className="text-sm text-gray-600">
              설정한 좌석 배치도가 실시간으로 표시됩니다
            </p>
          </CardHeader>
          <CardContent>
            {isValid() ? (
              <SeatChart config={createPreviewConfig()} />
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>좌석 타입과 위치를 설정하면</p>
                <p>미리보기가 표시됩니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 등급별 좌석 수 정보 */}
        {isValid() && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>등급별 좌석 수</CardTitle>
              <p className="text-sm text-gray-600">
                현재 설정으로 계산된 등급별 좌석 수입니다
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getSeatGradePreview().map((grade) => (
                  <div
                    key={grade.seatGrade}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{grade.seatGrade}</span>
                    <span className="text-gray-600">{grade.capacity}석</span>
                  </div>
                ))}
                <div className="pt-2 mt-3 border-t">
                  <div className="flex items-center justify-between font-semibold">
                    <span>총 좌석 수</span>
                    <span>
                      {getSeatGradePreview().reduce(
                        (total, grade) => total + grade.capacity,
                        0,
                      )}
                      석
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 최종 데이터 JSON */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>JSON 데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(formData, null, 2)}
              className="h-40"
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
