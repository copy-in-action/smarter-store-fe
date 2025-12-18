"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type {
  SeatChartConfig,
  SeatTypeObject,
  StaticSeatVenue,
} from "../types/seatLayout.types";
import { extractSeatGradeInfo } from "../utils/seatConverters";
import SeatChart from "./SeatChart";

/**
 * 2단계 가격 설정 컴포넌트 속성
 */
interface Step2PriceConfigProps {
  /** 1단계에서 받은 정적 좌석 데이터 */
  step1Data: StaticSeatVenue;
  /** 초기 가격 데이터 */
  initialData?: Partial<StaticSeatVenue>;
  /** 가격 데이터 변경 핸들러 */
  onDataChange: (data: SeatTypeObject) => void;
  /** 이전 단계로 이동 핸들러 */
  onPrevious: () => void;
  /** 다음 단계로 진행 핸들러 */
  onNext: () => void;
  /** 가격 저장 핸들러 (선택적) */
  onSave?: (priceData: SeatTypeObject) => Promise<void>;
}

/**
 * 2단계: 좌석 타입별 가격을 설정하는 컴포넌트
 */
export function Step2PriceConfig({
  step1Data,
  initialData,
  onDataChange,
  onPrevious,
  onNext,
  onSave,
}: Step2PriceConfigProps) {
  /**
   * 초기 가격 데이터 생성
   */
  const initializePrices = (): Record<
    string,
    { label: string; price?: number }
  > => {
    if (initialData?.seatTypes) {
      return initialData.seatTypes;
    }

    return Object.fromEntries(
      Object.entries(step1Data.seatTypes).map(([key, seatType]) => [
        key,
        { ...seatType, price: 0 },
      ]),
    );
  };

  const [priceData, setPriceData] = useState<SeatTypeObject>({
    seatTypes: initializePrices(),
  });
  const [isSaving, setIsSaving] = useState(false);

  /**
   * step1Data가 변경되면 가격 데이터도 업데이트
   */
  useEffect(() => {
    const currentKeys = Object.keys(priceData.seatTypes);
    const step1Keys = Object.keys(step1Data.seatTypes);

    // 새로운 좌석 타입이 추가되었거나 삭제된 경우
    if (
      currentKeys.length !== step1Keys.length ||
      !step1Keys.every((key) => currentKeys.includes(key))
    ) {
      const updated = Object.fromEntries(
        Object.entries(step1Data.seatTypes).map(([key, seatType]) => [
          key,
          priceData.seatTypes[key] || { ...seatType, price: 0 },
        ]),
      );

      const newData = { seatTypes: updated };
      setPriceData(newData);
      onDataChange(newData);
    }
  }, [step1Data.seatTypes, priceData.seatTypes, onDataChange]);

  /**
   * 특정 좌석 타입의 가격 업데이트
   */
  const updatePrice = (seatTypeKey: string, price: number) => {
    const updated = {
      ...priceData.seatTypes,
      [seatTypeKey]: {
        ...priceData.seatTypes[seatTypeKey],
        price,
      },
    };

    const newData = { seatTypes: updated };
    setPriceData(newData);
    onDataChange(newData);
  };

  /**
   * 가격 포맷팅 (천 단위 구분자)
   */
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return Number(numericValue).toLocaleString();
  };

  /**
   * 가격 입력 핸들러
   */
  const handlePriceInput = (seatTypeKey: string, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ""));
    updatePrice(seatTypeKey, numericValue);
  };

  /**
   * 유효성 검사
   */
  const isValid = () => {
    return Object.values(priceData.seatTypes).every(
      (seatType) => (seatType.price || 0) > 0,
    );
  };

  /**
   * 총 좌석 수 계산 (실제 활성화된 좌석 수)
   */
  const getTotalSeats = () => {
    const gradeInfo = extractSeatGradeInfo(step1Data);
    return gradeInfo.reduce((total, grade) => total + grade.seatCount, 0);
  };

  /**
   * 타입별 정확한 좌석 수 계산
   */
  const getSeatsPerType = (seatTypeKey: string) => {
    const gradeInfo = extractSeatGradeInfo(step1Data);
    const gradeData = gradeInfo.find((grade) => grade.gradeId === seatTypeKey);
    return gradeData ? gradeData.seatCount : 0;
  };

  /**
   * 가격 정보를 서버에 저장
   */
  const handleSave = async () => {
    if (!onSave || !isValid()) return;

    setIsSaving(true);
    try {
      await onSave(priceData);
    } catch (error) {
      console.error("가격 저장 실패:", error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 미리보기용 SeatChartConfig 생성
   */
  const createPreviewConfig = (): SeatChartConfig => {
    // 좌석 타입에 현재 가격 정보 추가 (이미 priceData.seatTypes에 포함됨)
    const seatTypesWithPrice = Object.fromEntries(
      Object.entries(priceData.seatTypes).map(([key, seatType]) => [
        key,
        {
          ...seatType,
          cssClass: "economy", // 임시 CSS 클래스
        },
      ]),
    );

    return {
      ...step1Data,
      seatTypes: seatTypesWithPrice,
      mode: "view",
      // 임시 예매 상태 데이터
      reservedSeats: [],
      pendingSeats: [],
      selectedSeats: [],
    };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
      {/* 설정 패널 */}
      <div className="space-y-6 col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>좌석 배치도 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">총 좌석 수:</span>{" "}
                <span className="text-gray-900">{getTotalSeats()}석</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">좌석 타입 수:</span>{" "}
                <span className="text-gray-900">
                  {Object.keys(step1Data.seatTypes).length}개
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>좌석 타입별 가격 설정</CardTitle>
            <p className="text-sm text-gray-600">
              각 좌석 타입의 가격을 설정해주세요.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(priceData.seatTypes).map(
              ([seatTypeKey, seatType]) => {
                const seatCount = getSeatsPerType(seatTypeKey);

                return (
                  <div
                    key={seatTypeKey}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {seatType.label}
                      </div>
                      <div className="text-sm text-gray-500">{seatCount}석</div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`price-${seatTypeKey}`}>가격 (원)</Label>
                      <Input
                        id={`price-${seatTypeKey}`}
                        value={formatPrice((seatType.price || 0).toString())}
                        onChange={(e) =>
                          handlePriceInput(seatTypeKey, e.target.value)
                        }
                        placeholder="0"
                        className="text-right"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">예상 총 수익</div>
                      <div className="font-semibold text-blue-600">
                        {((seatType.price || 0) * seatCount).toLocaleString()}원
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </CardContent>
        </Card>

        {/* 가격 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>가격 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(priceData.seatTypes)
                .sort(([, a], [, b]) => (b.price || 0) - (a.price || 0))
                .map(([seatTypeKey, seatType]) => {
                  return (
                    <div
                      key={seatTypeKey}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-700">{seatType.label}</span>
                      <span className="font-medium">
                        {(seatType.price || 0).toLocaleString()}원
                      </span>
                    </div>
                  );
                })}
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>예상 총 수익</span>
                  <span className="text-blue-600">
                    {Object.entries(priceData.seatTypes)
                      .reduce(
                        (total, [seatTypeKey, seatType]) =>
                          total +
                          (seatType.price || 0) * getSeatsPerType(seatTypeKey),
                        0,
                      )
                      .toLocaleString()}
                    원
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button onClick={onPrevious} variant="outline">
            이전 단계
          </Button>
          <div className="flex items-center gap-4">
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={!isValid() || isSaving}
                variant="outline"
                className="px-6"
              >
                {isSaving ? "저장 중..." : "가격 저장"}
              </Button>
            )}
            <Button onClick={onNext} disabled={!isValid()} className="px-8">
              다음 단계
            </Button>
          </div>
        </div>
      </div>

      {/* 미리보기 패널 */}
      <div className="sticky top-8 col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <p className="text-sm text-gray-600">
              설정한 가격이 반영된 좌석 배치도입니다
            </p>
          </CardHeader>
          <CardContent>
            <SeatChart config={createPreviewConfig()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
