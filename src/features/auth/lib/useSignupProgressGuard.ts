"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PAGES } from "@/shared/constants";
import { SignupStep, useSignupStore } from "./useSignupStore";

/**
 * 회원가입 단계별 필요한 데이터 체크 함수
 */
const getRequiredDataForStep = (step: SignupStep) => {
  switch (step) {
    case SignupStep.PHONE_VERIFICATION:
      return []; // 1단계는 선행 조건 없음

    case SignupStep.EMAIL_INPUT:
    case SignupStep.EMAIL_VERIFICATION:
      return ["phoneVerification"]; // 2,3단계는 1단계 필요

    case SignupStep.PASSWORD_SETUP:
      return ["phoneVerification", "emailInput"]; // 4단계는 1,2단계 필요

    default:
      return [];
  }
};

/**
 * 회원가입 진행상황 체크 및 리다이렉션 훅
 * 현재 단계에 필요한 이전 단계 데이터가 없으면 첫 페이지로 리다이렉트합니다
 */
export function useSignupProgressGuard(currentStep: SignupStep) {
  const router = useRouter();
  const signupStore = useSignupStore();

  useEffect(() => {
    // 필요한 이전 단계 데이터 목록 가져오기
    const requiredData = getRequiredDataForStep(currentStep);

    // 모든 필요한 데이터가 있는지 체크
    const hasAllRequiredData = requiredData.every((dataKey) => {
      const data = signupStore[dataKey as keyof typeof signupStore];
      return data !== null && data !== undefined;
    });

    // 필요한 데이터가 없으면 첫 페이지로 리다이렉트
    if (!hasAllRequiredData) {
      console.log(
        `리다이렉트: ${currentStep} → 첫 페이지 (필요한 데이터 누락)`,
      );
      router.replace(PAGES.AUTH.SIGNUP.EMAIL.OCCUPANCY_VERIFICATION.path);
    }
  }, [currentStep, signupStore, router]);

  /**
   * 현재 단계 진행 가능 여부 반환
   */
  const canProceed = () => {
    const requiredData = getRequiredDataForStep(currentStep);
    return requiredData.every((dataKey) => {
      const data = signupStore[dataKey as keyof typeof signupStore];
      return data !== null && data !== undefined;
    });
  };

  return {
    canProceed: canProceed(),
    currentStep,
    signupData: signupStore,
  };
}
