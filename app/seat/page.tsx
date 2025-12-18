"use client";

import { useState } from "react";
import { Step1StaticVenueConfig } from "@/shared/lib/seat/components/Step1StaticVenueConfig";
import { Step2PriceConfig } from "@/shared/lib/seat/components/Step2PriceConfig";
import { Step3FinalView } from "@/shared/lib/seat/components/Step3FinalView";
import type {
  SeatChartConfig,
  SeatGradeForBE,
  SeatTypeObject,
  StaticSeatVenue,
} from "@/shared/lib/seat/types/seatLayout.types";
import { extractSeatGradeInfo } from "@/shared/lib/seat/utils/seatConverters";
import { Stepper } from "@/shared/ui/stepper";

/**
 * 좌석 배치도 설정 페이지 (3단계)
 */
const SeatPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStaticSeatVenue] = useState<StaticSeatVenue | null>({
    venueId: 1,
    rows: 10,
    columns: 20,
    seatTypes: {
      SEAT_CLASS_1: {
        label: "R",
      },
      SEAT_CLASS_2: {
        label: "S",
      },
      SEAT_CLASS_3: {
        label: "A",
      },
      SEAT_CLASS_4: {
        label: "B",
      },
    },
    seatGrades: [
      {
        seatTypeKey: "SEAT_CLASS_1",
        position: "1:",
      },
      {
        seatTypeKey: "SEAT_CLASS_1",
        position: "2:",
      },
      {
        seatTypeKey: "SEAT_CLASS_2",
        position: "3:",
      },
      {
        seatTypeKey: "SEAT_CLASS_2",
        position: "4:",
      },
      {
        seatTypeKey: "SEAT_CLASS_3",
        position: "5:",
      },
      {
        seatTypeKey: "SEAT_CLASS_3",
        position: "6:",
      },
      {
        seatTypeKey: "SEAT_CLASS_4",
        position: "7:",
      },
    ],
    disabledSeats: [
      {
        row: 0,
        col: 0,
      },
      {
        row: 0,
        col: 1,
      },
      {
        row: 0,
        col: 2,
      },
      {
        row: 0,
        col: 0,
      },
      {
        row: 0,
        col: 17,
      },
      {
        row: 0,
        col: 18,
      },
      {
        row: 0,
        col: 19,
      },
      {
        row: 1,
        col: 0,
      },
      {
        row: 1,
        col: 1,
      },
      {
        row: 1,
        col: 2,
      },
      {
        row: 1,
        col: 17,
      },
      {
        row: 1,
        col: 18,
      },
      {
        row: 1,
        col: 19,
      },
      {
        row: 2,
        col: 0,
      },
      {
        row: 2,
        col: 1,
      },
      {
        row: 2,
        col: 18,
      },
      {
        row: 2,
        col: 19,
      },
      {
        row: 3,
        col: 0,
      },
      {
        row: 3,
        col: 19,
      },
    ],
    rowSpacers: [2, 6],
    columnSpacers: [3, 7, 13, 17],
  });
  const [step2Data, setStep2Data] = useState<SeatTypeObject | null>(null);

  /**
   * 스테퍼 단계 정의
   */
  const steps = [
    {
      step: 1,
      title: "좌석 배치도 설정",
      description: "기본 설정과 좌석 타입 정의",
    },
    {
      step: 2,
      title: "가격 설정",
      description: "좌석 타입별 가격 입력",
    },
    {
      step: 3,
      title: "미리보기",
      description: "완성된 좌석 배치도 확인",
    },
  ];

  /**
   * 단계별 완료 여부 확인
   */
  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1:
        return step1Data !== null;
      case 2:
        return step2Data !== null;
      case 3:
        return step1Data !== null && step2Data !== null;
      default:
        return false;
    }
  };

  /**
   * 1단계 완료 핸들러
   */
  const handleStep1Complete = (data: StaticSeatVenue) => {
    setStaticSeatVenue(data);
  };

  /**
   * 1단계 BE 저장 핸들러 (예시)
   */
  const handleStep1Save = async (
    data: StaticSeatVenue,
    gradeInfo: SeatGradeForBE[],
  ) => {
    try {
      // API 호출 예시
      const response = await fetch("/api/venues/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layoutJson: data, // JSON으로 저장
          seatGrades: gradeInfo, // 등급별 정보는 별도 처리
        }),
      });

      if (!response.ok) {
        throw new Error("저장 실패");
      }

      console.log("좌석 배치도 저장 완료:", { data, gradeInfo });
    } catch (error) {
      console.error("저장 에러:", error);
      throw error; // 컴포넌트에서 에러 처리
    }
  };

  /**
   * 1단계 다음 버튼 핸들러
   */
  const handleStep1Next = () => {
    if (step1Data) {
      setCurrentStep(2);
    }
  };

  /**
   * 2단계 데이터 변경 핸들러
   */
  const handleStep2Change = (data: SeatTypeObject) => {
    setStep2Data(data);
  };

  /**
   * 2단계 가격 저장 핸들러
   */
  const handleStep2Save = async (priceData: SeatTypeObject) => {
    try {
      // 등급별 좌석 수 정보 추출 (step1Data 기반)
      if (!step1Data) {
        throw new Error("1단계 데이터가 없습니다.");
      }

      const gradeInfo = extractSeatGradeInfo(step1Data);

      // 가격 정보와 등급 정보를 매칭하여 서버 전송용 데이터 생성
      const priceInfoForBE = gradeInfo.map((grade) => ({
        gradeId: grade.gradeId,
        gradeName: grade.gradeName,
        seatCount: grade.seatCount,
        price: priceData.seatTypes[grade.gradeId]?.price || 0,
      }));

      // API 호출 예시
      const response = await fetch("/api/venues/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId: step1Data.venueId,
          priceInfo: priceInfoForBE,
        }),
      });

      if (!response.ok) {
        throw new Error("가격 저장 실패");
      }

      console.log("가격 정보 저장 완료:", priceInfoForBE);
    } catch (error) {
      console.error("가격 저장 에러:", error);
      throw error; // 컴포넌트에서 에러 처리
    }
  };

  /**
   * 2단계 이전 단계 핸들러
   */
  const handleStep2Previous = () => {
    setCurrentStep(1);
  };

  /**
   * 2단계 다음 버튼 핸들러
   */
  const handleStep2Next = () => {
    if (step2Data) {
      setCurrentStep(3);
    }
  };

  /**
   * 3단계 이전 단계 핸들러
   */
  const handleStep3Previous = () => {
    setCurrentStep(2);
  };

  /**
   * 1단계와 2단계 데이터를 합쳐서 완성된 SeatChartConfig 생성
   */
  const createFinalSeatConfig = (
    step1Data: StaticSeatVenue,
    step2Data: SeatTypeObject,
  ): SeatChartConfig => {
    // 좌석 타입에 가격 정보 추가
    const seatTypesWithPrice = Object.fromEntries(
      Object.entries(step1Data.seatTypes).map(([key, seatType]) => {
        const seatTypeWithPrice = step2Data.seatTypes[key];
        return [
          key,
          {
            ...seatType,
            price: seatTypeWithPrice?.price || 0,
          },
        ];
      }),
    );

    return {
      ...step1Data,
      seatTypes: seatTypesWithPrice,
      mode: "view",
      // 예매 상태 데이터 (예시)
      reservedSeats: [
        { row: 0, col: 5 },
        { row: 0, col: 6 },
        { row: 1, col: 7 },
      ],
      pendingSeats: [
        { row: 2, col: 8 },
        { row: 3, col: 9 },
      ],
      // 사용자 선택 상태
      selectedSeats: [],
    };
  };

  /**
   * 최종 완료 핸들러
   */
  const handleFinalComplete = (finalConfig: SeatChartConfig) => {
    console.log("최종 설정 완료:", finalConfig);
    // 여기서 서버에 저장하거나 다른 처리를 할 수 있습니다
    alert("좌석 배치도 설정이 완료되었습니다!");
  };

  /**
   * 스테퍼 클릭으로 단계 변경
   */
  const handleStepChange = (step: number) => {
    // 이전 단계가 완료된 경우에만 이동 허용
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && isStepCompleted(1)) {
      setCurrentStep(2);
    } else if (step === 3 && isStepCompleted(1) && isStepCompleted(2)) {
      setCurrentStep(3);
    }
  };

  /**
   * 현재 단계에 따른 컴포넌트 렌더링
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1StaticVenueConfig
            initialData={step1Data || undefined}
            onDataChange={handleStep1Complete}
            onNext={handleStep1Next}
            onSave={handleStep1Save}
          />
        );
      case 2:
        return step1Data ? (
          <Step2PriceConfig
            step1Data={step1Data}
            initialData={step2Data || undefined}
            onDataChange={handleStep2Change}
            onPrevious={handleStep2Previous}
            onNext={handleStep2Next}
            onSave={handleStep2Save}
          />
        ) : null;
      case 3:
        return step1Data && step2Data ? (
          <Step3FinalView
            seatChartConfig={createFinalSeatConfig(step1Data, step2Data)}
            onPrevious={handleStep3Previous}
            onComplete={handleFinalComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            좌석 배치도 설정
          </h1>
          <p className="text-gray-600">3단계를 통해 좌석 배치도를 설정하세요</p>
        </div>

        {/* 스테퍼 */}
        <div className="mb-12">
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepChange={handleStepChange}
            isStepCompleted={isStepCompleted}
          />
        </div>

        {/* 현재 단계 컴포넌트 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default SeatPage;
