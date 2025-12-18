"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
  SeatGradeConfig,
  SeatGradeForBE,
  StaticSeatVenue,
} from "../types/seatLayout.types";
import { extractSeatGradeInfo } from "../utils/seatConverters";
import SeatChart from "./SeatChart";

/**
 * 1단계 정적 좌석 배치도 설정 컴포넌트 속성
 */
interface Step1StaticVenueConfigProps {
  /** 초기 데이터 */
  initialData?: Partial<StaticSeatVenue>;
  /** 설정 변경 핸들러 */
  onDataChange: (data: StaticSeatVenue) => void;
  /** 다음 단계로 진행 핸들러 */
  onNext: () => void;
  /** BE 저장 핸들러 (선택적) */
  onSave?: (
    data: StaticSeatVenue,
    gradeInfo: SeatGradeForBE[],
  ) => Promise<void>;
}

/**
 * 1단계: 정적 좌석 배치도 설정을 입력받는 컴포넌트
 */
export function Step1StaticVenueConfig({
  initialData,
  onDataChange,
  onNext,
  onSave,
}: Step1StaticVenueConfigProps) {
  const [formData, setFormData] = useState<StaticSeatVenue>({
    venueId: initialData?.venueId || 0,
    rows: initialData?.rows || 10,
    columns: initialData?.columns || 20,
    seatTypes: initialData?.seatTypes || {},
    seatGrades: initialData?.seatGrades || [],
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
   * 좌석 타입 추가
   */
  const addSeatType = () => {
    const newKey = `SEAT_CLASS_${Object.keys(formData.seatTypes).length + 1}`;
    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [newKey]: {
          label: `새 타입 ${Object.keys(formData.seatTypes).length + 1}`,
        },
      },
    });
  };

  /**
   * 좌석 타입 삭제
   */
  const removeSeatType = (keyToRemove: string) => {
    const { [keyToRemove]: removed, ...remaining } = formData.seatTypes;
    updateFormData({
      seatTypes: remaining,
      seatGrades: formData.seatGrades.filter(
        (grade) => grade.seatTypeKey !== keyToRemove,
      ),
    });
  };

  /**
   * 좌석 타입 라벨 변경
   */
  const updateSeatTypeLabel = (key: string, label: string) => {
    updateFormData({
      seatTypes: {
        ...formData.seatTypes,
        [key]: { ...formData.seatTypes[key], label },
      },
    });
  };

  /**
   * 좌석 등급 설정 추가
   */
  const addSeatGrade = () => {
    const firstSeatTypeKey = Object.keys(formData.seatTypes)[0];
    if (!firstSeatTypeKey) return;

    updateFormData({
      seatGrades: [
        ...formData.seatGrades,
        { seatTypeKey: firstSeatTypeKey, position: "1:" },
      ],
    });
  };

  /**
   * 좌석 등급 설정 삭제
   */
  const removeSeatGrade = (index: number) => {
    updateFormData({
      seatGrades: formData.seatGrades.filter((_, i) => i !== index),
    });
  };

  /**
   * 좌석 등급 설정 업데이트
   */
  const updateSeatGrade = (
    index: number,
    field: keyof SeatGradeConfig,
    value: string,
  ) => {
    const updated = [...formData.seatGrades];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ seatGrades: updated });
  };

  /**
   * 유효성 검사
   */
  const isValid = () => {
    return (
      formData.rows > 0 &&
      formData.columns > 0 &&
      Object.keys(formData.seatTypes).length > 0 &&
      formData.seatGrades.length > 0
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
    // 좌석 타입에 임시 가격(0)과 cssClass 추가
    const seatTypesWithDefaults = Object.fromEntries(
      Object.entries(formData.seatTypes).map(([key, seatType]) => [
        key,
        {
          ...seatType,
          price: 0, // 1단계에서는 가격 0으로 표시
          cssClass: "economy", // 임시 CSS 클래스
        },
      ]),
    );

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
    <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
      {/* 설정 패널 */}
      <div className="col-span-2">
        <Accordion
          type="multiple"
          defaultValue={["basic", "seatTypes", "seatGrades"]}
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
                  <Button onClick={addSeatType} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    타입 추가
                  </Button>
                </div>
                {Object.entries(formData.seatTypes).map(([key, seatType]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`seatType-${key}`}>타입 라벨</Label>
                      <Input
                        id={`seatType-${key}`}
                        value={seatType.label}
                        onChange={(e) =>
                          updateSeatTypeLabel(key, e.target.value)
                        }
                        placeholder="좌석 타입 라벨"
                      />
                    </div>
                    <Button
                      onClick={() => removeSeatType(key)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {Object.keys(formData.seatTypes).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    좌석 타입을 추가해주세요
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 좌석 등급 설정 */}
          <AccordionItem
            value="seatGrades"
            className="bg-white border border-gray-200 rounded-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900">
              좌석 등급 설정
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    onClick={addSeatGrade}
                    size="sm"
                    disabled={Object.keys(formData.seatTypes).length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    등급 추가
                  </Button>
                </div>
                {formData.seatGrades.map((grade, index) => (
                  <div
                    key={`${grade.seatTypeKey}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`seatType-${index}`}>좌석 타입</Label>
                      <select
                        id={`seatType-${index}`}
                        value={grade.seatTypeKey}
                        onChange={(e) =>
                          updateSeatGrade(index, "seatTypeKey", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {Object.entries(formData.seatTypes).map(
                          ([key, seatType]) => (
                            <option key={key} value={key}>
                              {seatType.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`position-${index}`}>
                        위치 (예: "3:" or ":5")
                      </Label>
                      <Input
                        id={`position-${index}`}
                        value={grade.position}
                        onChange={(e) =>
                          updateSeatGrade(index, "position", e.target.value)
                        }
                        placeholder="1:, :5, 3:5 등"
                      />
                    </div>
                    <Button
                      onClick={() => removeSeatGrade(index)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.seatGrades.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    좌석 등급을 설정해주세요
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
                  <p className="text-gray-500 text-center py-4">
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
                  <p className="text-gray-500 text-center py-4">
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
                  <p className="text-gray-500 text-center py-4">
                    열 간격이 설정되지 않았습니다
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between items-center mt-6">
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
          <Button onClick={onNext} disabled={!isValid()} className="px-8">
            다음 단계
          </Button>
        </div>
      </div>

      {/* 미리보기 패널 */}
      <div className="sticky top-8  col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <p className="text-sm text-gray-600">
              설정한 좌석 배치도가 실시간으로 표시됩니다
            </p>
          </CardHeader>
          <CardContent>
            {Object.keys(formData.seatTypes).length > 0 &&
            formData.seatGrades.length > 0 ? (
              <SeatChart config={createPreviewConfig()} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>좌석 타입과 등급을 설정하면</p>
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
                {getSeatGradePreview().map((grade, index) => (
                  <div
                    key={grade.gradeId}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{grade.gradeName}</span>
                    <span className="text-gray-600">{grade.seatCount}석</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>총 좌석 수</span>
                    <span>
                      {getSeatGradePreview().reduce(
                        (total, grade) => total + grade.seatCount,
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
