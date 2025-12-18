"use client";

import { useState } from "react";
import type {
  SeatingChartRequestSeatingChart,
  SeatingChartResponse,
} from "@/shared/api/orval/types";
import { extractSeatGradeInfo, StaticSeatChart } from "@/shared/lib/seat";
import type { StaticSeatVenue } from "@/shared/lib/seat/types/seatLayout.types";
import { useSaveSeatingChart, useSeatingChart } from "../lib/hooks";
import { getDefaultSeatingChart } from "../lib/utils";

/**
 * 좌석 배치도 관리자 컴포넌트 Props
 */
interface SeatingChartManagerProps {
  /** 공연장 ID */
  venueId: number;
  /** 공연장 이름 */
  venueName: string;
  /** 서버에서 미리 가져온 좌석 배치도 데이터 */
  initialData?: SeatingChartResponse | null;
}

/**
 * 좌석 배치도 관리자 컴포넌트
 */
export function SeatingChartManager({
  venueId,
  venueName,
  initialData,
}: SeatingChartManagerProps) {
  const { data: existingSeatingChart, isLoading } = useSeatingChart(
    venueId,
    initialData,
  );
  const saveSeatingChartMutation = useSaveSeatingChart(venueId);

  /**
   * 기본 좌석 배치도 설정
   */
  const defaultStaticSeatVenue = getDefaultSeatingChart();

  /**
   * 현재 좌석 배치도 상태
   * 기존 데이터가 있으면 사용하고, 없으면 기본값 사용
   */
  const [staticSeatVenue, setStaticSeatVenue] =
    useState<StaticSeatVenue | null>(() => {
      return (existingSeatingChart?.seatingChart ||
        defaultStaticSeatVenue) as StaticSeatVenue;
    });

  /**
   * 1단계 완료 핸들러 - 좌석 배치도 데이터 업데이트
   * @param data - 업데이트된 좌석 배치도 데이터
   */
  const handleUpdateStaticSeatVenue = (data: StaticSeatVenue) => {
    setStaticSeatVenue(data);
  };

  /**
   * 좌석 배치도 저장 핸들러
   * @param data - 저장할 좌석 배치도 데이터
   * @param gradeInfo - 좌석 등급 정보 (현재 사용되지 않음)
   */
  const handleSaveSeatingChart = async () => {
    if (!staticSeatVenue) {
      console.error("좌석 배치도 데이터가 없습니다");
      return;
    }

    const request = {
      seatingChart: {
        ...staticSeatVenue,
        reservedSeats: [],
        pendingSeats: [],
      } as unknown as SeatingChartRequestSeatingChart,
      seatCapacities: extractSeatGradeInfo(staticSeatVenue),
    };

    await saveSeatingChartMutation.mutateAsync(request);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-gray-300 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">좌석 배치도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-xl font-bold text-gray-900">
            좌석 배치도 생성 ({venueName})
          </h1>
          <p className="text-sm text-gray-600">
            공연장의 배치도를 생성할 수 있습니다. 큰 화면으로 진행하시기
            바랍니다.
          </p>
        </div>

        <StaticSeatChart
          initialData={staticSeatVenue || undefined}
          onDataChange={handleUpdateStaticSeatVenue}
          onSave={handleSaveSeatingChart}
        />
      </div>
    </div>
  );
}
