import React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * 스테퍼 단계 정보
 */
interface StepperStep {
  /** 단계 번호 */
  step: number;
  /** 단계 제목 */
  title: string;
  /** 단계 설명 */
  description?: string;
}

/**
 * 스테퍼 컴포넌트 속성
 */
interface StepperProps {
  /** 현재 활성 단계 */
  currentStep: number;
  /** 스테퍼 단계 배열 */
  steps: StepperStep[];
  /** 단계 변경 핸들러 */
  onStepChange?: (step: number) => void;
  /** 완료된 단계인지 확인하는 함수 */
  isStepCompleted?: (step: number) => boolean;
}

/**
 * 다단계 진행 상황을 표시하는 스테퍼 컴포넌트
 */
export function Stepper({
  currentStep,
  steps,
  onStepChange,
  isStepCompleted,
}: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((stepInfo, index) => {
          const isActive = currentStep === stepInfo.step;
          const isCompleted = isStepCompleted?.(stepInfo.step) || false;
          const isClickable = onStepChange && (isCompleted || isActive);

          return (
            <React.Fragment key={stepInfo.step}>
              <div className="flex flex-col items-center">
                <button
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    {
                      "bg-blue-600 text-white": isActive && !isCompleted,
                      "bg-green-600 text-white": isCompleted,
                      "bg-gray-200 text-gray-500": !isActive && !isCompleted,
                      "cursor-pointer hover:bg-opacity-80": isClickable,
                      "cursor-default": !isClickable,
                    }
                  )}
                  onClick={() => isClickable && onStepChange?.(stepInfo.step)}
                  disabled={!isClickable}
                >
                  {isCompleted ? "✓" : stepInfo.step}
                </button>
                <div className="mt-2 text-center">
                  <div
                    className={cn("text-sm font-medium", {
                      "text-blue-600": isActive,
                      "text-green-600": isCompleted,
                      "text-gray-500": !isActive && !isCompleted,
                    })}
                  >
                    {stepInfo.title}
                  </div>
                  {stepInfo.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {stepInfo.description}
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn("flex-1 h-0.5 mx-4", {
                    "bg-green-600": isCompleted,
                    "bg-gray-200": !isCompleted,
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}